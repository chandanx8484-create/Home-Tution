
import React from 'react';

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const STATUS_COLORS = {
  present: "bg-green-100 text-green-700 border-green-200",
  absent: "bg-red-100 text-red-700 border-red-200",
  late: "bg-yellow-100 text-yellow-700 border-yellow-200",
  excused: "bg-blue-100 text-blue-700 border-blue-200",
  holiday: "bg-purple-100 text-purple-700 border-purple-200"
};

export const FEE_STATUS_COLORS = {
  paid: "bg-green-100 text-green-700 border-green-200",
  unpaid: "bg-red-100 text-red-700 border-red-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200"
};

export const STATUS_ICONS = {
  present: <i className="fas fa-check-circle"></i>,
  absent: <i className="fas fa-times-circle"></i>,
  late: <i className="fas fa-clock"></i>,
  excused: <i className="fas fa-info-circle"></i>,
  holiday: <i className="fas fa-mug-hot"></i>
};
