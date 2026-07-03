import React, { useState } from 'react';

interface BodyPart {
  id: string;
  name: string;
  path: string;
}

export const FRONT_PARTS: BodyPart[] = [
  { id: 'head', name: 'Head', path: 'M12,2C10,2 8,3.5 8,5.5C8,7.5 10,9 12,9C14,9 16,7.5 16,5.5C16,3.5 14,2 12,2Z' },
  { id: 'neck', name: 'Neck', path: 'M10,9L10,11L14,11L14,9C13,9.5 11,9.5 10,9Z' },
  { id: 'shoulder_l', name: 'Left Shoulder', path: 'M14,11C16,11 18,12 19,14L18,16L14,15L14,11Z' },
  { id: 'shoulder_r', name: 'Right Shoulder', path: 'M10,11C8,11 6,12 5,14L6,16L10,15L10,11Z' },
  { id: 'chest', name: 'Chest', path: 'M10,11L14,11L15,15L12,16L9,15L10,11Z' },
  { id: 'abs', name: 'Abdomen', path: 'M9,15L12,16L15,15L14,20L10,20L9,15Z' },
  { id: 'arm_l', name: 'Left Arm', path: 'M19,14L20,16L18,17L18,16L19,14Z' },
  { id: 'arm_r', name: 'Right Arm', path: 'M5,14L4,16L6,17L6,16L5,14Z' },
  { id: 'elbow_l', name: 'Left Elbow', path: 'M20,16L21,18L19,19L18,17L20,16Z' },
  { id: 'elbow_r', name: 'Right Elbow', path: 'M4,16L3,18L5,19L6,17L4,16Z' },
  { id: 'forearm_l', name: 'Left Forearm', path: 'M21,18L22,21L20,22L19,19L21,18Z' },
  { id: 'forearm_r', name: 'Right Forearm', path: 'M3,18L2,21L4,22L5,19L3,18Z' },
  { id: 'hand_l', name: 'Left Hand', path: 'M22,21L23,23L21,24L20,22L22,21Z' },
  { id: 'hand_r', name: 'Right Hand', path: 'M2,21L1,23L3,24L4,22L2,21Z' },
  { id: 'hip_l', name: 'Left Hip', path: 'M12,20L14,20L15,22L12,23L12,20Z' },
  { id: 'hip_r', name: 'Right Hip', path: 'M10,20L12,20L12,23L9,22L10,20Z' },
  { id: 'thigh_l', name: 'Left Thigh', path: 'M12,23L15,22L16,28L13,29L12,23Z' },
  { id: 'thigh_r', name: 'Right Thigh', path: 'M12,23L9,22L8,28L11,29L12,23Z' },
  { id: 'knee_l', name: 'Left Knee', path: 'M13,29L16,28L16,31L13,32L13,29Z' },
  { id: 'knee_r', name: 'Right Knee', path: 'M11,29L8,28L8,31L11,32L11,29Z' },
  { id: 'leg_l', name: 'Left Leg', path: 'M13,32L16,31L15,38L13,38L13,32Z' },
  { id: 'leg_r', name: 'Right Leg', path: 'M11,32L8,31L9,38L11,38L11,32Z' },
  { id: 'foot_l', name: 'Left Foot', path: 'M13,38L15,38L16,40L13,40L13,38Z' },
  { id: 'foot_r', name: 'Right Foot', path: 'M11,38L9,38L8,40L11,40L11,38Z' },
];

export const BACK_PARTS: BodyPart[] = [
  { id: 'occiput', name: 'Occiput (Back of Head)', path: 'M12,2C10,2 8,3.5 8,5.5C8,7.5 10,9 12,9C14,9 16,7.5 16,5.5C16,3.5 14,2 12,2Z' },
  { id: 'upper_back', name: 'Upper Back / Trapezius', path: 'M10,11L14,11L15,15L12,16L9,15L10,11Z' },
  { id: 'lower_back', name: 'Lower Back / Lumbar', path: 'M9,15L12,16L15,15L14,20L10,20L9,15Z' },
  { id: 'spine_thoracic', name: 'Thoracic Spine', path: 'M11.8,11L12.2,11L12.2,16L11.8,16L11.8,11Z' },
  { id: 'spine_lumbar', name: 'Lumbar Spine', path: 'M11.8,16L12.2,16L12.2,20L11.8,20L11.8,16Z' },
  { id: 'glute_l', name: 'Left Glute', path: 'M12,20L14,20L15,23L12,24L12,20Z' },
  { id: 'glute_r', name: 'Right Glute', path: 'M10,20L12,20L12,24L9,23L10,20Z' },
  { id: 'calf_l', name: 'Left Calf', path: 'M13,32L16,31L15,38L13,38L13,32Z' },
  { id: 'calf_r', name: 'Right Calf', path: 'M11,32L8,31L9,38L11,38L11,32Z' },
];

export const BODY_SILHOUETTE_PATH = "M12,2C10,2 8,3.5 8,5.5C8,7.5 10,9 12,9C14,9 16,7.5 16,5.5C16,3.5 14,2 12,2M10,9L9,11C7,11 5,12 4,14L6,21L9,20L10,38L11,38L11,23L12,23L13,23L13,38L14,38L15,20L18,21L20,14C19,12 17,11 15,11L14,9";

interface AnatomyMapProps {
  selectedParts: string[];
  onChange: (parts: string[]) => void;
}

export function AnatomyMap({ selectedParts, onChange }: AnatomyMapProps) {
  const [view, setView] = useState<'front' | 'back'>('front');

  const togglePart = (id: string) => {
    if (selectedParts.includes(id)) {
      onChange(selectedParts.filter(p => p !== id));
    } else {
      onChange([...selectedParts, id]);
    }
  };

  const currentParts = view === 'front' ? FRONT_PARTS : BACK_PARTS;

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800">Pain Assessment Map</h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Click to select pain areas</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          <button
            onClick={() => setView('front')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'front' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Front
          </button>
          <button
            onClick={() => setView('back')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'back' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Back
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8">
        {/* SVG Body Container */}
        <div className="relative w-64 h-[450px] bg-white rounded-3xl border border-slate-100 shadow-sm flex items-center justify-center p-4">
          <svg viewBox="0 0 24 40" className="w-full h-full drop-shadow-lg">
            {/* Outline Silhouette */}
            <path
              d={BODY_SILHOUETTE_PATH}
              fill="#f1f5f9"
              stroke="#cbd5e1"
              strokeWidth="0.5"
            />
            {/* Interactive Parts */}
            {currentParts.map(part => (
              <path
                key={part.id}
                d={part.path}
                className={`cursor-pointer transition-all duration-300 hover:opacity-80 ${selectedParts.includes(part.id) ? 'fill-orange-500 stroke-orange-600' : 'fill-slate-200 stroke-slate-300'}`}
                onClick={() => togglePart(part.id)}
              >
                <title>{part.name}</title>
              </path>
            ))}
          </svg>
        </div>

        {/* Selected Parts List */}
        <div className="flex-1 w-full">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm min-h-[150px]">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Selected Pain Points</h4>
            <div className="flex flex-wrap gap-2">
              {selectedParts.length > 0 ? (
                selectedParts.map(pId => {
                  const part = [...FRONT_PARTS, ...BACK_PARTS].find(p => p.id === pId);
                  return (
                    <span key={pId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-xl text-xs font-bold border border-orange-100 animate-in zoom-in-95 duration-200">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {part?.name}
                      <button onClick={() => togglePart(pId)} className="ml-1 hover:text-orange-800">×</button>
                    </span>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center w-full py-8 text-slate-400">
                  <p className="text-sm font-medium italic">No areas selected yet</p>
                  <p className="text-[10px] mt-1">Select regions on the map to mark pain</p>

                </div>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/10/50 rounded-xl border border-primary/20">
              <p className="text-[10px] font-bold text-primary uppercase tracking-tighter">Pain Severity</p>
              <p className="text-lg font-black text-primary">{selectedParts.length > 3 ? 'Moderate' : selectedParts.length > 0 ? 'Mild' : 'None'}</p>
            </div>
            <div className="p-3 bg-slate-100/50 rounded-xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Clinical Priority</p>
              <p className="text-lg font-black text-slate-700">{selectedParts.length > 5 ? 'High' : 'Normal'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
