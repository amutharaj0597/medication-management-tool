import React, { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "../services/firebase-config";
import "./WeeklyPlanner.css";

const timeSlots = [
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner"
];

const getNext7Days = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + i);
    days.push(nextDay.toISOString().split("T")[0]);
  }
  return days;
};

const WeeklyPlanner = () => {
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(collection(db, "prescriptions"), where("uid", "==", uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrescriptions(data);
    });

    return () => unsubscribe();
  }, []);

  const days = getNext7Days();

  return (
    <div className="weekly-planner">
      <h2>Weekly Medication Planner</h2>
      <div className="planner-grid-rows">
        <div className="planner-header-row">
          <div className="slot-label" />
          {days.map((day) => (
            <div className="planner-day-col" key={day}>
              {day}
            </div>
          ))}
        </div>
        {timeSlots.map((slot) => (
          <div className="planner-row" key={slot}>
            <div className="slot-label">{slot}</div>
            {days.map((day) => (
              <div className="planner-cell" key={day + slot}>
                {prescriptions
                  .filter(
                    (p) =>
                      p.time === slot &&
                      p.startDate <= day &&
                      p.endDate >= day
                  )
                  .map((p) => (
                    <div className="planner-medicine" key={p.id}>
                      {p.medicineName} ({p.dosage})
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeeklyPlanner;
