import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  db, 
  isFirebaseConfigured, 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  addDoc,
  deleteDoc,
  mockDb,
  runTransaction,
  query,
  where,
  getDocs
} from "../firebase";

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const [slots, setSlots] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      // Setup Firestore Real-time Listeners
      const unsubscribeSlots = onSnapshot(collection(db, "slots"), (snapshot) => {
        const slotsData = [];
        snapshot.forEach((doc) => {
          slotsData.push({ id: doc.id, ...doc.data() });
        });
        setSlots(slotsData);
        setLoading(false);
      });

      const unsubscribeCandidates = onSnapshot(collection(db, "candidates"), (snapshot) => {
        const candidatesData = [];
        snapshot.forEach((doc) => {
          candidatesData.push({ id: doc.id, ...doc.data() });
        });
        setCandidates(candidatesData);
      });

      return () => {
        unsubscribeSlots();
        unsubscribeCandidates();
      };
    } else {
      // Setup Mock Real-time Listeners
      const loadMockData = () => {
        setSlots(mockDb.getSlots());
        setCandidates(mockDb.getCandidates());
        setLoading(false);
      };

      loadMockData();
      const unsubscribe = mockDb.subscribe(loadMockData);
      return unsubscribe;
    }
  }, []);

  // Rules validations before booking:
  // - A candidate can book only ONE slot
  // - Same email cannot book twice
  // - Same mobile cannot book twice
  // - Same slot cannot be booked twice
  const bookSlot = async (slotId, candidateData) => {
    const email = candidateData.email.toLowerCase().trim();
    const mobile = candidateData.mobile.trim();
    const duplicateErrorMessage = "You have already booked an interview slot using this email address or mobile number. Only one interview booking is allowed per candidate. If you need to change your interview schedule, please use the Reschedule option or contact the NeuroMorphix recruitment team.";

    // Frontend pre-check validation
    const emailExists = candidates.some(c => c.email.toLowerCase().trim() === email && c.status !== "Cancelled");
    const mobileExists = candidates.some(c => c.mobile.trim() === mobile && c.status !== "Cancelled");

    if (emailExists || mobileExists) {
      throw new Error(duplicateErrorMessage);
    }

    // Check if slot is still available in local memory
    const slot = slots.find(s => s.id === slotId);
    if (!slot) {
      throw new Error("The selected slot does not exist.");
    }
    if (slot.isBooked || slot.isDisabled) {
      throw new Error("This slot is no longer available.");
    }

    // Unique Booking ID: NMX-2026-XXXXXX
    const randomId = Math.floor(100000 + Math.random() * 900000);
    const bookingId = `NMX-2026-${randomId}`;

    const newCandidate = {
      ...candidateData,
      email,
      mobile,
      bookingId,
      slotId,
      date: slot.date,
      time: slot.time,
      status: "Booked", // Booked, Attended, Absent, Selected, Rejected, Cancelled
      createdAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      // Perform database transaction to guarantee no double booking / duplicate candidates
      await runTransaction(db, async (transaction) => {
        // 1. Check if the slot is still available in Firestore
        const slotRef = doc(db, "slots", slotId);
        const slotDoc = await transaction.get(slotRef);
        
        if (!slotDoc.exists()) {
          throw new Error("The selected slot does not exist in the database.");
        }
        
        const slotData = slotDoc.data();
        if (slotData.isBooked || slotData.isDisabled) {
          throw new Error("This slot is no longer available.");
        }

        // 2. Perform candidate check inside transaction using collection reads
        // To be safe in transaction read sequence, we get docs from candidates collection
        const candidatesRef = collection(db, "candidates");
        
        // Find existing candidate bookings by email
        const emailQuery = query(candidatesRef, where("email", "==", email));
        const emailSnap = await getDocs(emailQuery);
        const hasActiveEmail = emailSnap.docs.some(doc => doc.data().status !== "Cancelled");

        // Find existing candidate bookings by mobile
        const mobileQuery = query(candidatesRef, where("mobile", "==", mobile));
        const mobileSnap = await getDocs(mobileQuery);
        const hasActiveMobile = mobileSnap.docs.some(doc => doc.data().status !== "Cancelled");

        if (hasActiveEmail || hasActiveMobile) {
          throw new Error(duplicateErrorMessage);
        }

        // 3. Create candidate document reference
        const newCandidateRef = doc(collection(db, "candidates"));

        // 4. Perform the write operations inside transaction
        transaction.set(newCandidateRef, newCandidate);
        transaction.update(slotRef, {
          isBooked: true,
          candidateId: newCandidateRef.id
        });
      });

      return newCandidate;
    } else {
      // Mock db updates
      const updatedSlots = slots.map(s => {
        if (s.id === slotId) {
          return { ...s, isBooked: true, candidateId: bookingId };
        }
        return s;
      });

      const updatedCandidates = [...candidates, { ...newCandidate, id: bookingId }];
      
      mockDb.saveSlots(updatedSlots);
      mockDb.saveCandidates(updatedCandidates);
      return newCandidate;
    }
  };

  const cancelBooking = async (bookingId) => {
    const candidate = candidates.find(c => c.bookingId === bookingId || c.id === bookingId);
    if (!candidate) {
      throw new Error("Booking not found.");
    }

    // Check if booking is within 24 hours deadline
    const interviewDateTime = new Date(`${candidate.date} ${candidate.time}`);
    const timeDiff = interviewDateTime.getTime() - new Date().getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      throw new Error("Bookings can only be cancelled or rescheduled at least 24 hours before the scheduled time.");
    }

    if (isFirebaseConfigured && db) {
      // Cancel booking in Firestore
      const candidateRef = doc(db, "candidates", candidate.id);
      const slotRef = doc(db, "slots", candidate.slotId);
      
      await updateDoc(candidateRef, { status: "Cancelled" });
      await updateDoc(slotRef, { isBooked: false, candidateId: null });
    } else {
      // Mock db cancellation
      const updatedCandidates = candidates.map(c => {
        if (c.bookingId === bookingId || c.id === bookingId) {
          return { ...c, status: "Cancelled" };
        }
        return c;
      });

      const updatedSlots = slots.map(s => {
        if (s.id === candidate.slotId) {
          return { ...s, isBooked: false, candidateId: null };
        }
        return s;
      });

      mockDb.saveCandidates(updatedCandidates);
      mockDb.saveSlots(updatedSlots);
    }
  };

  const rescheduleBooking = async (bookingId, newSlotId) => {
    const candidate = candidates.find(c => c.bookingId === bookingId || c.id === bookingId);
    if (!candidate) {
      throw new Error("Booking not found.");
    }

    const interviewDateTime = new Date(`${candidate.date} ${candidate.time}`);
    const timeDiff = interviewDateTime.getTime() - new Date().getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff < 24) {
      throw new Error("Bookings can only be rescheduled at least 24 hours before the scheduled time.");
    }

    const newSlot = slots.find(s => s.id === newSlotId);
    if (!newSlot || newSlot.isBooked || newSlot.isDisabled) {
      throw new Error("Selected slot is not available.");
    }

    if (isFirebaseConfigured && db) {
      const oldSlotRef = doc(db, "slots", candidate.slotId);
      const newSlotRef = doc(db, "slots", newSlotId);
      const candidateRef = doc(db, "candidates", candidate.id);

      await updateDoc(oldSlotRef, { isBooked: false, candidateId: null });
      await updateDoc(newSlotRef, { isBooked: true, candidateId: candidate.id });
      await updateDoc(candidateRef, {
        slotId: newSlotId,
        date: newSlot.date,
        time: newSlot.time
      });
    } else {
      const updatedSlots = slots.map(s => {
        if (s.id === candidate.slotId) {
          return { ...s, isBooked: false, candidateId: null };
        }
        if (s.id === newSlotId) {
          return { ...s, isBooked: true, candidateId: bookingId };
        }
        return s;
      });

      const updatedCandidates = candidates.map(c => {
        if (c.bookingId === bookingId || c.id === bookingId) {
          return { ...c, slotId: newSlotId, date: newSlot.date, time: newSlot.time };
        }
        return c;
      });

      mockDb.saveSlots(updatedSlots);
      mockDb.saveCandidates(updatedCandidates);
    }
  };

  // Admin: Update candidate status (Mark status like Attended, Absent, Selected, etc.)
  const updateCandidateStatus = async (candidateId, status) => {
    if (isFirebaseConfigured && db) {
      const candidateRef = doc(db, "candidates", candidateId);
      await updateDoc(candidateRef, { status });
    } else {
      const updatedCandidates = candidates.map(c => {
        if (c.id === candidateId) {
          return { ...c, status };
        }
        return c;
      });
      mockDb.saveCandidates(updatedCandidates);
    }
  };

  // Admin Slot Management
  const addSlot = async (slotData) => {
    const newSlot = {
      date: slotData.date,
      time: slotData.time,
      isBooked: false,
      isDisabled: false,
      candidateId: null
    };

    if (isFirebaseConfigured && db) {
      const slotRef = doc(collection(db, "slots"));
      await setDoc(slotRef, newSlot);
    } else {
      const newId = `slot_${Date.now()}`;
      const updatedSlots = [...slots, { ...newSlot, id: newId }];
      mockDb.saveSlots(updatedSlots);
    }
  };

  const deleteSlot = async (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot?.isBooked) {
      throw new Error("Cannot delete a booked slot. Cancel the candidate's booking first.");
    }

    if (isFirebaseConfigured && db) {
      const slotRef = doc(db, "slots", slotId);
      await deleteDoc(slotRef);
    } else {
      const updatedSlots = slots.filter(s => s.id !== slotId);
      mockDb.saveSlots(updatedSlots);
    }
  };

  const toggleSlotDisabledStatus = async (slotId) => {
    const slot = slots.find(s => s.id === slotId);
    if (slot?.isBooked) {
      throw new Error("Cannot disable a slot that is already booked.");
    }
    const nextDisabledState = !slot.isDisabled;

    if (isFirebaseConfigured && db) {
      const slotRef = doc(db, "slots", slotId);
      await updateDoc(slotRef, { isDisabled: nextDisabledState });
    } else {
      const updatedSlots = slots.map(s => {
        if (s.id === slotId) {
          return { ...s, isDisabled: nextDisabledState };
        }
        return s;
      });
      mockDb.saveSlots(updatedSlots);
    }
  };

  const bulkCreateSlots = async (dates, times) => {
    if (isFirebaseConfigured && db) {
      // In Firestore we create them asynchronously
      for (const date of dates) {
        for (const time of times) {
          const newSlot = {
            date,
            time,
            isBooked: false,
            isDisabled: false,
            candidateId: null
          };
          const slotRef = doc(collection(db, "slots"));
          await setDoc(slotRef, newSlot);
        }
      }
    } else {
      let id = Date.now();
      const newSlots = [];
      dates.forEach(date => {
        times.forEach(time => {
          newSlots.push({
            id: `slot_${id++}`,
            date,
            time,
            isBooked: false,
            isDisabled: false,
            candidateId: null
          });
        });
      });
      mockDb.saveSlots([...slots, ...newSlots]);
    }
  };

  return (
    <BookingContext.Provider value={{
      slots,
      candidates,
      loading,
      bookSlot,
      cancelBooking,
      rescheduleBooking,
      updateCandidateStatus,
      addSlot,
      deleteSlot,
      toggleSlotDisabledStatus,
      bulkCreateSlots
    }}>
      {children}
    </BookingContext.Provider>
  );
};
