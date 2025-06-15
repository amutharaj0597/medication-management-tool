import { useState, useEffect } from "react";
import { auth, db } from "../services/firebase-config";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  getDoc,
  doc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

// ✅ Move scheduleReminders and timeSlotMap outside the component
const timeSlotMap = {
  "Before Breakfast": "08:00",
  "After Breakfast": "09:00",
  "Before Lunch": "12:30",
  "After Lunch": "14:00",
  "Before Dinner": "18:30",
  "After Dinner": "20:00"
};

const scheduleReminders = (prescriptions) => {
  const now = new Date();

  prescriptions.forEach((p) => {
    const time = timeSlotMap[p.time];
    if (!time) return;

    let current = new Date(p.startDate);
    const end = new Date(p.endDate);

    while (current <= end) {
      const [hour, minute] = time.split(":");
      const reminderTime = new Date(current);
      reminderTime.setHours(parseInt(hour));
      reminderTime.setMinutes(parseInt(minute));
      reminderTime.setSeconds(0);

      const diff = reminderTime.getTime() - now.getTime();
      if (diff > 0 && diff < 3600000) {
        setTimeout(() => {
          if (Notification.permission === "granted") {
            new Notification("💊 Medicine Reminder", {
              body: `${p.medicineName} (${p.dosage}) - ${p.time}`
            });
          }
        }, diff);
      }

      current.setDate(current.getDate() + 1);
    }
  });
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        setUser({ ...currentUser, name: userSnap.data()?.name });
      } else {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]); // ✅ Fix: added 'navigate' to dependencies

  const handleAddPrescription = async () => {
    if (!medicineName || !dosage || !startDate || !endDate || !time) {
      alert("Please fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "prescriptions"), {
        uid: user.uid,
        medicineName,
        dosage,
        startDate,
        endDate,
        time,
        createdAt: new Date()
      });

      setMedicineName("");
      setDosage("");
      setStartDate("");
      setEndDate("");
      setTime("");
    } catch (error) {
      alert("Error adding prescription: " + error.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    if (!user?.uid) return;

    if ("Notification" in window) {
      Notification.requestPermission();
    }

    const q = query(collection(db, "prescriptions"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPrescriptions = snapshot.docs.map((doc) => doc.data());
      scheduleReminders(allPrescriptions);
    });

    return () => unsubscribe();
  }, [user]); // ✅ No need to add `scheduleReminders` if it's outside the component

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Dashboard</h3>
        <button onClick={() => navigate("/prescription")}>Prescription</button>
        <button onClick={() => navigate("/weekly-planner")}>Weekly Planner</button>
        <button onClick={() => navigate("/notification")}>Notification</button>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="main-content">
        <h2>Welcome, {user?.name || user?.email}</h2>

        <div className="prescription-form">
          <input
            type="text"
            placeholder="Medicine Name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Dosage"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
          />
          <div className="date-group">
            <label>
              Start Date
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            <option value="">Select Time</option>
            <option value="Before Breakfast">Before Breakfast</option>
            <option value="After Breakfast">After Breakfast</option>
            <option value="Before Lunch">Before Lunch</option>
            <option value="After Lunch">After Lunch</option>
            <option value="Before Dinner">Before Dinner</option>
            <option value="After Dinner">After Dinner</option>
          </select>
          <button onClick={handleAddPrescription}>Add Prescription</button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
