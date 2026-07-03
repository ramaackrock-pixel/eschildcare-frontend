import { useState } from 'react';
import { X, Save, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rooms: any[]) => Promise<void>;
}

export function RoomModal({ isOpen, onClose, onSave }: RoomModalProps) {
  const [formData, setFormData] = useState({
    number: '',
    type: 'GENERAL',
    department: 'General Ward',
    pricePerDay: 500,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.number.trim()) {
      toast.error('Room number is required');
      return;
    }

    if (formData.pricePerDay < 0) {
      toast.error('Price cannot be negative');
      return;
    }

    const bedNumbers = formData.number.split(',').map(n => n.trim()).filter(n => n);

    if (bedNumbers.length === 0) {
      toast.error('Please enter valid bed numbers');
      return;
    }

    setIsSubmitting(true);
    try {
      const roomsToCreate = bedNumbers.map(bed => ({
        ...formData,
        number: bed,
        status: 'AVAILABLE'
      }));
      await onSave(roomsToCreate);
      onClose();
    } catch (error) {
      console.error('Failed to save room', error);
      toast.error('Failed to create room/bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Add New Bed/Room</h2>
              <p className="text-xs font-medium text-slate-500">Configure ward layout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <form id="roomForm" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Room / Bed Number(s) *</label>
              <input
                type="text"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g., Bed 1, Bed 2, Bed 3 (comma separated)"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="GENERAL">General</option>
                  <option value="SEMIPRIVATE">Semi-Private</option>
                  <option value="PRIVATE">Private</option>
                  <option value="ICU">ICU / Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Price Per Day (INR)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                placeholder="e.g., Pediatrics, General Ward"
                required
              />
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="roomForm"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSubmitting ? 'Saving...' : 'Add Bed'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
