// components/DataPicker.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Calendar, Users, MessageSquare, FileText, Hash, Save } from 'lucide-react';

const DataPicker = () => {

    const [groups, setGroups] = useState([]);
    const [useCustomGroup, setUseCustomGroup] = useState(false);


    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await fetch("/api/groups");
                const data = await res.json();
                if (data.success) {
                    setGroups(data.groups);
                }
            } catch (err) {
                console.error("Failed to load groups", err);
            }
        };

        fetchGroups();
    }, []);


    const handleGroupSelect = (e) => {
        const value = e.target.value;

        if (value === "__new__") {
            setUseCustomGroup(true);
            setGroupInfo({ groupName: "", groupId: "" });
            return;
        }

        const selected = groups.find(g => g.group_id === value);
        if (selected) {
            setUseCustomGroup(false);
            setGroupInfo({
                groupName: selected.group_name,
                groupId: selected.group_id,
            });
        }
    };



    const [personInfo, setPersonInfo] = useState({
        profileName: '',
        profileId: '',
        phoneNumber: '',
        address: '',
        occupation: '',
        age: ''
    });

    const [groupInfo, setGroupInfo] = useState({
        groupName: '',
        groupId: '',
    });

    const [postInfo, setPostInfo] = useState({
        postDetails: '',
        comments: ''
    });

    const [errors, setErrors] = useState({});

    const handlePersonChange = (e) => {
        const { name, value } = e.target;
        setPersonInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleGroupChange = (e) => {
        const { name, value } = e.target;
        setGroupInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePostChange = (e) => {
        const { name, value } = e.target;
        setPostInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Validate required person fields
        if (!personInfo.profileName.trim()) {
            newErrors.profileName = 'Profile Name is required';
        }
        if (!personInfo.profileId.trim()) {
            newErrors.profileId = 'Profile ID is required';
        }
        if (!groupInfo.groupName.trim()) {
            newErrors.groupName = 'Group Name is required';
        }
        if (!groupInfo.groupId.trim()) {
            newErrors.groupId = 'Group ID is required';
        }

        // Validate phone number format 
        if (personInfo.phoneNumber && !/^[\d\s\-+()]+$/.test(personInfo.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        // Validate age 
        if (personInfo.age && (isNaN(personInfo.age) || personInfo.age < 1 || personInfo.age > 120)) {
            newErrors.age = 'Please enter a valid age (1-120)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            // Prepare data for database
            const formData = {
                person: personInfo,
                group: groupInfo,
                post: postInfo,
                collectedAt: new Date().toISOString()
            };

            console.log('Data:', formData);

            try {
                const response = await fetch("/api/save-data", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                if (result.success) {
                    alert("Data saved successfully!");

                    // Reset all forms
                    setPersonInfo({
                        profileName: '',
                        profileId: '',
                        phoneNumber: '',
                        address: '',
                        occupation: '',
                        age: ''
                    });
                    setGroupInfo({
                        groupName: '',
                        groupId: '',
                    });
                    setPostInfo({
                        postDetails: '',
                        comments: ''
                    });
                } else {
                    alert("Failed to save data: " + (result.error || "Unknown error"));
                }
            } catch (error) {
                console.error("Error saving data:", error);
                alert("Failed to save data. Please check your connection.");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Facebook Data Collector
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Person Information Section*/}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-7 h-7 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Person Information
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Profile Name */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <User className="w-4 h-4" />
                                    Profile Name
                                </label>
                                <input
                                    type="text"
                                    name="profileName"
                                    value={personInfo.profileName}
                                    onChange={handlePersonChange}
                                    className={`text-gray-500 w-full px-4 py-3 rounded-lg border ${errors.profileName ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter Facebook profile name"
                                />
                                {errors.profileName && (
                                    <p className="text-red-500 text-sm">{errors.profileName}</p>
                                )}
                            </div>

                            {/* Profile ID */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <User className="w-4 h-4" />
                                    Profile ID
                                </label>
                                <input
                                    type="text"
                                    name="profileId"
                                    value={personInfo.profileId}
                                    onChange={handlePersonChange}
                                    className={`text-gray-500 w-full px-4 py-3 rounded-lg border ${errors.profileId ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter Facebook profile ID"
                                />
                                {errors.profileId && (
                                    <p className="text-red-500 text-sm">{errors.profileId}</p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Phone className="w-4 h-4" />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={personInfo.phoneNumber}
                                    onChange={handlePersonChange}
                                    className={`text-gray-500 w-full px-4 py-3 rounded-lg border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter phone number"
                                />
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MapPin className="w-4 h-4" />
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={personInfo.address}
                                    onChange={handlePersonChange}
                                    className="text-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter address"
                                />
                            </div>

                            {/* Occupation */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Briefcase className="w-4 h-4" />
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={personInfo.occupation}
                                    onChange={handlePersonChange}
                                    className="text-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Enter occupation"
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <Calendar className="w-4 h-4" />
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={personInfo.age}
                                    onChange={handlePersonChange}
                                    min="1"
                                    max="120"
                                    className={`text-gray-500 w-full px-4 py-3 rounded-lg border ${errors.age ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                                    placeholder="Enter age"
                                />
                                {errors.age && (
                                    <p className="text-red-500 text-sm">{errors.age}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Group Information Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-7 h-7 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Group Information
                            </h2>
                        </div>

                        {/* Dropdown */}
                        <div className="space-y-2 mb-6">
                            <label className="text-sm font-medium text-gray-700">
                                Select Existing Group
                            </label>
                            <select
                                onChange={handleGroupSelect}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-600"
                            >
                                <option value="">-- Select Group --</option>
                                {groups.map((g) => (
                                    <option key={g.group_id} value={g.group_id}>
                                        {g.group_name}
                                    </option>
                                ))}
                                <option value="__new__">➕ Add New Group</option>
                            </select>
                        </div>

                        {/* Manual Entry */}
                        {useCustomGroup && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Facebook Group Name
                                    </label>
                                    <input
                                        type="text"
                                        name="groupName"
                                        value={groupInfo.groupName}
                                        onChange={handleGroupChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300"
                                        placeholder="Enter Facebook group name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        Facebook Group ID
                                    </label>
                                    <input
                                        type="text"
                                        name="groupId"
                                        value={groupInfo.groupId}
                                        onChange={handleGroupChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300"
                                        placeholder="Enter Facebook group ID"
                                    />
                                </div>
                            </div>
                        )}
                    </div>


                    {/* Post Information Section */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <FileText className="w-7 h-7 text-purple-600" />
                            <h2 className="text-2xl font-bold text-gray-800">
                                Post Information
                            </h2>
                        </div>

                        <div className="space-y-6">
                            {/* Post Details */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <FileText className="w-4 h-4" />
                                    Post Details
                                </label>
                                <textarea
                                    name="postDetails"
                                    value={postInfo.postDetails}
                                    onChange={handlePostChange}
                                    rows="4"
                                    className="text-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Enter post details (content, description, etc.)"
                                />
                            </div>

                            {/* Comments */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <MessageSquare className="w-4 h-4" />
                                    Comments
                                </label>
                                <textarea
                                    name="comments"
                                    value={postInfo.comments}
                                    onChange={handlePostChange}
                                    rows="4"
                                    className="text-gray-500 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                                    placeholder="Enter comments (can include multiple comments separated by new lines)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-blue-300 focus:outline-none"
                        >
                            <Save className="w-5 h-5" />
                            Save All Information
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DataPicker;