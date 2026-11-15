import React from 'react';
import { Eye, Edit3, Trash2 } from 'lucide-react';

export const TableActions = ({ onView, onEdit, onDelete }) => {
  return (
    <div className="flex items-center justify-end gap-1.5">
      {onView && (
        <button
          onClick={onView}
          title="View Details"
          className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
        >
          <Eye className="w-4 h-4" />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          title="Edit Record"
          className="p-1.5 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          title="Delete Record"
          className="p-1.5 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
