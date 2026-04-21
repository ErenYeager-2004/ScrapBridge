import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package,
  MapPin,
  Camera,
  Plus,
  Trash2,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
} from 'lucide-react';
import ImageUpload from '../../components/forms/ImageUpload';
import { createRequest } from '../../api/requests.api';

const MATERIAL_TYPES = [
  'IRON_STEEL',
  'COPPER',
  'ALUMINIUM',
  'BRASS',
  'PLASTIC',
  'PAPER_CARDBOARD',
  'GLASS',
  'E_WASTE',
  'RUBBER',
  'MIXED',
];

const MATERIAL_LABELS = {
  IRON_STEEL:      'Iron / Steel',
  COPPER:          'Copper',
  ALUMINIUM:       'Aluminium',
  BRASS:           'Brass',
  PLASTIC:         'Plastic',
  PAPER_CARDBOARD: 'Paper / Cardboard',
  GLASS:           'Glass',
  E_WASTE:         'E-Waste',
  RUBBER:          'Rubber',
  MIXED:           'Mixed / Other',
};

const STEPS = [
  { id: 1, label: 'Materials',          Icon: Package },
  { id: 2, label: 'Location & Contact', Icon: MapPin },
  { id: 3, label: 'Photos',             Icon: Camera },
];

export default function NewRequest() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [materialType,     setMaterialType]     = useState(MATERIAL_TYPES[0]);
  const [estimatedWeight,  setEstimatedWeight]  = useState('');
  const [items,            setItems]            = useState([]);

  // Step 2 state
  const [pickupAddress, setPickupAddress] = useState('');
  const [contactPhone,  setContactPhone]  = useState('');
  const [notes,         setNotes]         = useState('');

  // Step 3 state
  const [photos, setPhotos] = useState([]);

  /* ─── helpers ──────────────────────────────────────────────── */

  const addItem = () => {
    const w = parseFloat(estimatedWeight);
    if (!estimatedWeight || isNaN(w) || w <= 0) {
      toast.error('Enter a valid weight greater than 0');
      return;
    }
    setItems((prev) => [...prev, { materialType, estimatedWeight: w }]);
    setEstimatedWeight('');
  };

  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const goNext = () => {
    if (step === 1) {
      if (items.length === 0) { toast.error('Add at least one material item'); return; }
    }
    if (step === 2) {
      if (!pickupAddress.trim()) { toast.error('Pickup address is required'); return; }
      if (!contactPhone.trim())  { toast.error('Contact phone is required');  return; }
    }
    setStep((s) => s + 1);
  };

  const goBack = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('items',          JSON.stringify(items));
      fd.append('pickupAddress',  pickupAddress.trim());
      fd.append('contactPhone',   contactPhone.trim());
      fd.append('notes',          notes.trim());
      photos.forEach((file) => fd.append('photos', file));

      await createRequest(fd);
      toast.success('Pickup request submitted successfully!');
      navigate('/user/requests');
    } catch (err) {
      const msg = err?.response?.data?.errors?.[0]?.msg
               || err?.response?.data?.message
               || 'Failed to submit request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── render ───────────────────────────────────────────────── */

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Pickup Request</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Fill in the details below to schedule a scrap pickup.
        </p>
      </div>

      {/* Step progress */}
      <div className="flex items-center mb-10">
        {STEPS.map(({ id, label, Icon }, idx) => (
          <div key={id} className="flex items-center flex-1">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step > id
                    ? 'bg-green-600 border-green-600 text-white'
                    : step === id
                    ? 'bg-green-600/10 border-green-600 text-green-600'
                    : 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-600'
                }`}
              >
                {step > id ? <CheckCircle size={18} /> : <Icon size={18} />}
              </div>
              <span
                className={`text-xs font-medium mt-1 hidden sm:block ${
                  step >= id ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector */}
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 transition-colors ${
                  step > id ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">

        {/* ── Step 1: Materials ─────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              What materials do you have?
            </h2>

            {/* Add item row */}
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Material Type
                </label>
                <select
                  value={materialType}
                  onChange={(e) => setMaterialType(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {MATERIAL_TYPES.map((t) => (
                    <option key={t} value={t}>{MATERIAL_LABELS[t]}</option>
                  ))}
                </select>
              </div>

              <div className="w-36">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={estimatedWeight}
                  onChange={(e) => setEstimatedWeight(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                  placeholder="e.g. 5"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            {/* Items list */}
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No items added yet. Add at least one material.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 px-4 py-3 rounded-lg border border-gray-100 dark:border-gray-600"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-800 dark:text-white">
                        {MATERIAL_LABELS[item.materialType]}
                      </span>
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-medium">
                        {item.estimatedWeight} kg
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
                <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
                  {items.length} item{items.length !== 1 ? 's' : ''} · Total:{' '}
                  {items.reduce((acc, i) => acc + i.estimatedWeight, 0).toFixed(1)} kg
                </p>
              </ul>
            )}
          </div>
        )}

        {/* ── Step 2: Location & Contact ────────────────────── */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Pickup Location & Contact
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Pickup Address <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                placeholder="Enter the full pickup address…"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any instructions for the collector, access codes, etc."
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Photos ────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Upload Photos
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Photos help us give you a more accurate quote.{' '}
                <span className="font-medium text-green-600">Recommended but not required.</span>
              </p>
            </div>
            <ImageUpload onChange={setPhotos} />
            {photos.length > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {photos.length} photo{photos.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? 'Submitting…' : '✓ Submit Request'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
