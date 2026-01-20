
import { GoogleGenAI } from "@google/genai";
import { Student, AttendanceRecord, FeeRecord } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const getAttendanceInsights = async (students: Student[], attendance: AttendanceRecord[], fees: FeeRecord[]) => {
  if (students.length === 0) return "No student data available.";

  const currentMonth = new Date().getMonth();
  const currentMonthFees = fees.filter(f => f.month === currentMonth);
  const totalCollected = currentMonthFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = currentMonthFees.filter(f => f.status !== 'paid').reduce((sum, f) => sum + f.amount, 0);

  const prompt = `
    Analyze the following performance and financial data for 'Scholars Point' for 2026.
    
    Students: ${JSON.stringify(students.map(s => ({ name: s.name, fee: s.monthlyFee })))}
    Attendance History: ${JSON.stringify(attendance.slice(-50))}
    Current Month Fees: Collected: ₹${totalCollected}, Pending: ₹${totalPending}
    
    Provide a professional, motivating summary covering:
    1. Overall attendance health.
    2. Fee collection status for this month.
    3. Any student concerns (low attendance or pending fees).
    Keep it concise and encouraging for the teacher. Use bullet points.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
      }
    });
    return response.text || "Unable to generate insights at this moment.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Error connecting to AI service.";
  }
};
