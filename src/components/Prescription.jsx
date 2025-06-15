import React, { useState, useEffect } from "react";
import { db, auth } from "../services/firebase-config";
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  orderBy
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Prescription.css";

function Prescription() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [filterTime, setFilterTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const q = query(
      collection(db, "prescriptions"),
      where("uid", "==", uid),
      orderBy("endDate", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "prescriptions", id));
  };

  const exportToPDF = async () => {
    const jsPDF = (await import("jspdf")).default;
    await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.text("Prescription List", 20, 10);

    const tableColumn = ["Medicine", "Dosage", "Start", "End", "Time"];
    const tableRows = prescriptions.map((item) => [
      item.medicineName,
      item.dosage,
      item.startDate,
      item.endDate,
      item.time
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20
    });

    doc.save("prescriptions.pdf");
  };

  const filtered = prescriptions.filter((p) => {
    const matchesName = p.medicineName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTime = filterTime ? p.time === filterTime : true;
    return matchesName && matchesTime;
  });

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h3>Dashboard</h3>
        <button onClick={() => navigate("/dashboard")}>Add Prescription</button>
        <button>Prescription</button>
      </div>

      <div className="main-content">
        <h2>Prescription List</h2>

        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search by Medicine Name"
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className="filter-dropdown"
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
          >
            <option value="">All Time Slots</option>
            <option value="Before Breakfast">Before Breakfast</option>
            <option value="After Breakfast">After Breakfast</option>
            <option value="Before Lunch">Before Lunch</option>
            <option value="After Lunch">After Lunch</option>
            <option value="Before Dinner">Before Dinner</option>
            <option value="After Dinner">After Dinner</option>
          </select>

          <button className="export-btn" onClick={exportToPDF}>
            Export to PDF
          </button>
        </div>

        <div className="prescription-grid">
          {filtered.map((prescription) => (
            <div className="prescription-card" key={prescription.id}>
              <h3>{prescription.medicineName}</h3>
              <p>Dosage: {prescription.dosage}</p>
              <p>Start Date: {prescription.startDate}</p>
              <p>End Date: {prescription.endDate}</p>
              <p>Time: {prescription.time}</p>
              <button onClick={() => handleDelete(prescription.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Prescription;
