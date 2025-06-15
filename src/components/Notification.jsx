import { useEffect, useState } from "react";
import { auth, db } from "../services/firebase-config";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import notificationSound from "../assets/notification.wav";
import "./Notification.css";

function Notification() {
  const [prescriptions, setPrescriptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        const q = query(
          collection(db, "prescriptions"),
          where("uid", "==", currentUser.uid)
        );
        onSnapshot(q, (snapshot) => {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }));
          setPrescriptions(data);
        });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]); // ✅ added navigate to fix ESLint warning

  useEffect(() => {
    if (prescriptions.length === 0) return;

    prescriptions.forEach((prescription) => {
      const now = new Date();
      const start = new Date(prescription.startDate);
      const end = new Date(prescription.endDate);

      if (now >= start && now <= end) {
        const times = {
          "Before Breakfast": 8,
          "After Breakfast": 9,
          "Before Lunch": 12,
          "After Lunch": 14,
          "Before Dinner": 18,
          "After Dinner": 20
        };

        const notifyHour = times[prescription.time];
        const todayTarget = new Date();
        todayTarget.setHours(notifyHour, 0, 0, 0);

        const delay = todayTarget.getTime() - now.getTime();

        if (delay > 0 && delay < 86400000) {
          setTimeout(() => {
            triggerNotification(prescription.medicineName, prescription.time);
          }, delay);
        }
      }
    });
  }, [prescriptions]);

  const triggerNotification = (medicineName, timeSlot) => {
    const audio = new Audio(notificationSound);
    audio.play();

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Medication Reminder", {
          body: `Time to take ${medicineName} (${timeSlot}) 💊`,
          icon: "/pill-icon.png"
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("Medication Reminder", {
              body: `Time to take ${medicineName} (${timeSlot}) 💊`,
              icon: "/pill-icon.png"
            });
          }
        });
      }
    }
  };

  return (
    <div className="notification-page">
      <h2>Notification Reminders</h2>
      <p>We’ll remind you at the correct time with an alert and sound!</p>
      <div className="notification-list">
        {prescriptions.map((p) => (
          <div key={p.id} className="notification-card">
            <h4>{p.medicineName}</h4>
            <p>{p.time}</p>
            <p>
              {p.startDate} to {p.endDate}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Notification;
