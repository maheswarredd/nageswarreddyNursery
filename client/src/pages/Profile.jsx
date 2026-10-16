import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Plus, Trash2, Edit2, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, refreshProfile, addAddress, updateAddress, deleteAddress } = useAuth();

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Address modal/form states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressData, setAddressData] = useState({
    fullName: '',
    mobile: '',
    houseNumber: '',
    street: '',
    villageTown: '',
    mandal: '',
    district: '',
    state: 'Andhra Pradesh',
    pinCode: '',
    landmark: '',
    deliveryInstructions: '',
    isDefault: false
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // In AuthContext we can call api.put('/auth/profile')
      const token = localStorage.getItem('nnp_token');
      await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, phone: profilePhone })
      });
      await refreshProfile();
      setProfileMsg('Profile updated successfully!');
      setEditingProfile(false);
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const openNewAddress = () => {
    setEditingAddressId(null);
    setAddressData({
      fullName: user?.name || '',
      mobile: user?.phone || '',
      houseNumber: '',
      street: '',
      villageTown: '',
      mandal: '',
      district: '',
      state: 'Andhra Pradesh',
      pinCode: '',
      landmark: '',
      deliveryInstructions: '',
      isDefault: false
    });
    setShowAddressModal(true);
  };

  const openEditAddress = (addr) => {
    setEditingAddressId(addr._id);
    setAddressData({
      fullName: addr.fullName,
      mobile: addr.mobile,
      houseNumber: addr.houseNumber,
      street: addr.street,
      villageTown: addr.villageTown,
      mandal: addr.mandal,
      district: addr.district,
      state: addr.state,
      pinCode: addr.pinCode,
      landmark: addr.landmark || '',
      deliveryInstructions: addr.deliveryInstructions || '',
      isDefault: addr.isDefault || false
    });
    setShowAddressModal(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, addressData);
      } else {
        await addAddress(addressData);
      }
      setShowAddressModal(false);
    } catch (err) {
      alert(err.message || 'Failed to save address.');
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm('Delete this saved delivery address?')) {
      await deleteAddress(id);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold font-heading text-forest-950">
          My Nursery Profile & Saved Addresses
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage personal contact details and multiple delivery locations.</p>
      </div>

      {profileMsg && (
        <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-xl">
          {profileMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-700 text-white font-bold text-lg flex items-center justify-center uppercase">
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
              <span className="text-xs text-forest-700 font-bold uppercase tracking-wider">{user?.role} Account</span>
            </div>
          </div>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            className="text-xs font-bold text-forest-700 hover:underline"
          >
            {editingProfile ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editingProfile ? (
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-forest-600"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition"
            >
              Save Profile
            </button>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-forest-700" />
              <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-forest-700" />
              <span>{user?.phone || 'No phone added yet'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg font-bold font-heading text-gray-900">
              Saved Delivery Addresses ({user?.addresses?.length || 0})
            </h2>
            <p className="text-xs text-gray-500">Fast one-click checkout across multiple home and farm addresses</p>
          </div>
          <button
            onClick={openNewAddress}
            className="px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {(!user?.addresses || user.addresses.length === 0) ? (
          <div className="p-8 text-center text-gray-400">
            <MapPin className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs font-medium">No saved delivery addresses.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses.map((addr) => (
              <div
                key={addr._id}
                className="p-5 rounded-2xl border border-gray-200 hover:border-forest-300 transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-gray-900">{addr.fullName}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-forest-800 bg-forest-100 px-2 py-0.5 rounded-full">
                        Default Address
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Phone: {addr.mobile}</p>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    Door {addr.houseNumber}, {addr.street}, {addr.villageTown}, {addr.mandal}, {addr.district}, {addr.state} - <strong>{addr.pinCode}</strong>
                  </p>
                  {addr.landmark && (
                    <p className="text-[11px] text-gray-400 mt-1">Landmark: {addr.landmark}</p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-end gap-3 text-xs">
                  <button
                    onClick={() => openEditAddress(addr)}
                    className="text-forest-700 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(addr._id)}
                    className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Address Form Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold font-heading text-gray-900">
              {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
            </h3>

            <form onSubmit={handleAddressSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={addressData.fullName}
                    onChange={(e) => setAddressData({ ...addressData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={addressData.mobile}
                    onChange={(e) => setAddressData({ ...addressData, mobile: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">House / Door No *</label>
                  <input
                    type="text"
                    required
                    value={addressData.houseNumber}
                    onChange={(e) => setAddressData({ ...addressData, houseNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Street *</label>
                  <input
                    type="text"
                    required
                    value={addressData.street}
                    onChange={(e) => setAddressData({ ...addressData, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Village/Town *</label>
                  <input
                    type="text"
                    required
                    value={addressData.villageTown}
                    onChange={(e) => setAddressData({ ...addressData, villageTown: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mandal *</label>
                  <input
                    type="text"
                    required
                    value={addressData.mandal}
                    onChange={(e) => setAddressData({ ...addressData, mandal: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    value={addressData.district}
                    onChange={(e) => setAddressData({ ...addressData, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addressData.state}
                    onChange={(e) => setAddressData({ ...addressData, state: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressData.pinCode}
                    onChange={(e) => setAddressData({ ...addressData, pinCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={addressData.isDefault}
                  onChange={(e) => setAddressData({ ...addressData, isDefault: e.target.checked })}
                  className="rounded text-forest-700"
                />
                <label htmlFor="isDefault" className="text-gray-700 font-medium cursor-pointer">
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-forest-700 text-white rounded-xl font-bold hover:bg-forest-800 transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
