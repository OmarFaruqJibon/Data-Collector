// components/DataPicker.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Briefcase, Calendar, Users, MessageSquare, FileText, Hash, Save, Search, ChevronDown, Plus, X } from 'lucide-react';

const DataPicker = () => {
    const [groups, setGroups] = useState([]);
    const [useCustomGroup, setUseCustomGroup] = useState(false);
    const [personSuggestions, setPersonSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [personDbId, setPersonDbId] = useState(null);
    const [personGroups, setPersonGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);

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
            setGroupInfo({ groupName: "", id: null });
            return;
        }

        const selected = personGroups.find(g => String(g.id) === value);
        if (selected) {
            setUseCustomGroup(false);
            setGroupInfo({
                id: selected.id,
                groupName: selected.group_name,
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
        id: null,
        groupName: "",
        note: ""
    });

    const [postInfo, setPostInfo] = useState({
        postDetails: '',
        comments: ''
    });

    const [errors, setErrors] = useState({});

    const handlePersonChange = async (e) => {
        const { name, value } = e.target;

        setPersonInfo(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "profileName") {
            if (value.length < 2) {
                setPersonSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            try {
                const res = await fetch(`/api/persons?q=${encodeURIComponent(value)}`);
                const data = await res.json();

                if (data.success) {
                    setPersonSuggestions(data.persons);
                    setShowSuggestions(true);
                }
            } catch (err) {
                console.error("Person search failed", err);
            }
        }
    };

    const selectPerson = async (person) => {
        console.log("Selected person:", person);
        setPersonInfo({
            profileName: person.profile_name,
            profileId: person.profile_id,
            phoneNumber: person.phone_number || "",
            address: person.address || "",
            occupation: person.occupation || "",
            age: person.age || "",
        });

        setShowSuggestions(false);
        setPersonDbId(person.id);

        const res = await fetch(`/api/person-groups?personId=${person.id}`);
        const data = await res.json();

        if (data.success) {
            setPersonGroups(data.groups);
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

    const validateForm = () => {
        const newErrors = {};

        if (!personInfo.profileName.trim()) {
            newErrors.profileName = 'Profile Name is required';
        }
        if (!personInfo.profileId.trim()) {
            newErrors.profileId = 'Profile ID is required';
        }
        if (!groupInfo.id && !groupInfo.groupName.trim()) {
            newErrors.groupName = "Group Name is required";
        }

        if (personInfo.phoneNumber && !/^[\d\s\-+()]+$/.test(personInfo.phoneNumber)) {
            newErrors.phoneNumber = 'Please enter a valid phone number';
        }

        if (personInfo.age && (isNaN(personInfo.age) || personInfo.age < 1 || personInfo.age > 120)) {
            newErrors.age = 'Please enter a valid age (1-120)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (validateForm()) {
            setIsLoading(true);
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
                        id: null,
                    });
                    setPostInfo({
                        postDetails: '',
                        comments: ''
                    });
                    setUseCustomGroup(false);
                } else {
                    alert("Failed to save data: " + (result.error || "Unknown error"));
                }
            } catch (error) {
                console.error("Error saving data:", error);
                alert("Failed to save data. Please check your connection.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setShowGroupDropdown(false);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl mb-6">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Users className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-800 to-indigo-800 bg-clip-text text-transparent mb-3">
                        Facebook Data Collector
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Collect and manage Facebook profile, group, and post information efficiently
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Person Information Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                                <User className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Person Information
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Enter or search for Facebook profile details
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Profile */}
                            <div className="space-y-2 relative">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Search className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Profile Name
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="profileName"
                                        value={personInfo.profileName}
                                        onChange={handlePersonChange}
                                        onFocus={() => personSuggestions.length && setShowSuggestions(true)}
                                        className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.profileName ? "border-red-400" : "border-gray-200 hover:border-blue-300"} bg-white/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                                        placeholder="Search Facebook profile..."
                                        autoComplete="off"
                                    />
                                    {personInfo.profileName && (
                                        <button
                                            type="button"
                                            onClick={() => setPersonInfo(prev => ({ ...prev, profileName: '' }))}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Suggestions Dropdown */}
                                {showSuggestions && personSuggestions.length > 0 && (
                                    <div className="fixed md:absolute z-50 w-[calc(100vw-2rem)] md:w-full max-w-[calc(100vw-2rem)] md:max-w-none mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden left-4 md:left-0 md:top-full">
                                        <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-sm font-semibold text-gray-700">Found {personSuggestions.length} profiles</span>
                                            </div>
                                        </div>
                                        <div
                                            className="max-h-96 overflow-y-auto custom-scrollbar"
                                            style={{ maxHeight: 'min(24rem, 60vh)' }}
                                        >
                                            {personSuggestions.map((p, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => selectPerson(p)}
                                                    className="px-4 py-3 cursor-pointer hover:bg-blue-50 border-b border-gray-50 last:border-b-0 transition-all duration-200 group"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-semibold text-gray-800 group-hover:text-blue-700">
                                                                {p.profile_name}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                                <span>ID: {p.profile_id}</span>
                                                                {p.phone_number && (
                                                                    <span className="flex items-center gap-1">
                                                                        <Phone className="w-3 h-3" />
                                                                        {p.phone_number}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform rotate-90" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {errors.profileName && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        {errors.profileName}
                                    </div>
                                )}
                            </div>

                            {/* Profile ID */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-blue-50 rounded-lg">
                                        <Hash className="w-4 h-4 text-blue-600" />
                                    </div>
                                    Profile ID
                                </label>
                                <input
                                    type="text"
                                    name="profileId"
                                    value={personInfo.profileId}
                                    onChange={handlePersonChange}
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.profileId ? 'border-red-400' : 'border-gray-200 hover:border-blue-300'} bg-white/50 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                                    placeholder="Enter profile ID"
                                />
                                {errors.profileId && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        {errors.profileId}
                                    </div>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-green-50 rounded-lg">
                                        <Phone className="w-4 h-4 text-green-600" />
                                    </div>
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={personInfo.phoneNumber}
                                    onChange={handlePersonChange}
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.phoneNumber ? 'border-red-400' : 'border-gray-200 hover:border-green-300'} bg-white/50 focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                                    placeholder="+1 (555) 123-4567"
                                />
                                {errors.phoneNumber && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        {errors.phoneNumber}
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-purple-50 rounded-lg">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                    </div>
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={personInfo.address}
                                    onChange={handlePersonChange}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-purple-300 bg-white/50 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                                    placeholder="Enter complete address"
                                />
                            </div>

                            {/* Occupation */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-amber-50 rounded-lg">
                                        <Briefcase className="w-4 h-4 text-amber-600" />
                                    </div>
                                    Occupation
                                </label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={personInfo.occupation}
                                    onChange={handlePersonChange}
                                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 bg-white/50 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                                    placeholder="Enter profession or occupation"
                                />
                            </div>

                            {/* Age */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-rose-50 rounded-lg">
                                        <Calendar className="w-4 h-4 text-rose-600" />
                                    </div>
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={personInfo.age}
                                    onChange={handlePersonChange}
                                    min="1"
                                    max="120"
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.age ? 'border-red-400' : 'border-gray-200 hover:border-rose-300'} bg-white/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                                    placeholder="Enter age"
                                />
                                {errors.age && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        {errors.age}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Group Information Section*/}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20 relative">

                        <div className="relative">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                                        <Users className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">
                                            Group Information
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-1">
                                            Select existing group or create new one
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setUseCustomGroup(true)}
                                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Group
                                </button>
                            </div>

                            {/*Dropdown */}
                            <div className="space-y-2 mb-8">
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Select Existing Group
                                </label>

                                <div className="relative">
                                    {/* Selected group display */}
                                    <button
                                        type="button"
                                        disabled={!personDbId}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowGroupDropdown(v => !v);
                                        }}
                                        className={`w-full text-left px-4 py-3.5 rounded-xl border-2 
        ${!personDbId
                                                ? "opacity-60 cursor-not-allowed border-gray-200"
                                                : "border-gray-200 hover:border-green-300 bg-white/50 focus:border-green-500"}
      `}
                                    >
                                        {groupInfo.groupName ? (
                                            <div>
                                                <div className="font-semibold text-gray-800">
                                                    {groupInfo.groupName}
                                                </div>
                                                {groupInfo.note && (
                                                    <div className="text-sm text-gray-500">
                                                        {groupInfo.note}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400">Choose a group...</span>
                                        )}
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                    </button>

                                    {/* Dropdown panel */}
                                    {showGroupDropdown && personDbId && (
                                        <div className="fixed md:absolute z-50 w-[calc(100vw-2rem)] md:w-full max-w-[calc(100vw-2rem)] md:max-w-none mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden left-4 md:left-0 md:top-full">
                                            <div
                                                className="overflow-y-auto custom-scrollbar"
                                                style={{ maxHeight: 'min(24rem, 60vh)' }}
                                            >
                                                {personGroups.map(g => (
                                                    <div
                                                        key={g.id}
                                                        onClick={() => {
                                                            setGroupInfo({
                                                                id: g.id,
                                                                groupName: g.group_name,
                                                                note: g.note || ""
                                                            });
                                                            setShowGroupDropdown(false);
                                                            setUseCustomGroup(false);
                                                        }}
                                                        className="px-4 py-3 cursor-pointer hover:bg-green-50 transition-all border-b border-gray-100 last:border-b-0"
                                                    >
                                                        <div className="font-semibold text-gray-800">
                                                            {g.group_name}
                                                        </div>
                                                        {g.note && (
                                                            <div className="text-sm text-gray-500 mt-0.5">
                                                                {g.note}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {personGroups.length > 0 && (
                                    <p className="text-sm text-gray-500 mt-2">
                                        {personGroups.length} group(s) found for this person
                                    </p>
                                )}
                            </div>

                            {/* Manual Entry */}
                            {useCustomGroup && (
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">
                                            Create New Group
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setUseCustomGroup(false)}
                                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Facebook Group Name
                                            </label>
                                            <input
                                                type="text"
                                                name="groupName"
                                                value={groupInfo.groupName}
                                                onChange={handleGroupChange}
                                                className={`w-full px-4 py-3.5 rounded-xl border-2 ${errors.groupName ? 'border-red-400' : 'border-green-200'} bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400`}
                                                placeholder="Enter Facebook group name"
                                            />
                                            {errors.groupName && (
                                                <div className="flex items-center gap-2 text-red-500 text-sm mt-2 p-2 bg-red-50 rounded-lg">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    {errors.groupName}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">
                                                Additional Notes
                                            </label>
                                            <input
                                                type="text"
                                                name='note'
                                                className="w-full px-4 py-3.5 rounded-xl border-2 border-green-200 bg-white focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400"
                                                placeholder="Optional description"
                                                value={groupInfo.note}
                                                onChange={handleGroupChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Post Information Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 border border-white/20">
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                                <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    Post Information
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Add post details and comments
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Post Details */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-purple-50 rounded-lg">
                                        <FileText className="w-4 h-4 text-purple-600" />
                                    </div>
                                    Post Details
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="postDetails"
                                        value={postInfo.postDetails}
                                        onChange={handlePostChange}
                                        rows="4"
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-purple-300 bg-white/50 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
                                        placeholder="Enter post content, description, links, or any relevant details..."
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                        {postInfo.postDetails.length}/5000
                                    </div>
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <div className="p-1.5 bg-pink-50 rounded-lg">
                                        <MessageSquare className="w-4 h-4 text-pink-600" />
                                    </div>
                                    Comments
                                    <span className="ml-auto text-xs font-normal text-gray-500">
                                        (Separate with new lines)
                                    </span>
                                </label>
                                <div className="relative">
                                    <textarea
                                        name="comments"
                                        value={postInfo.comments}
                                        onChange={handlePostChange}
                                        rows="4"
                                        className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-pink-300 bg-white/50 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all duration-300 text-gray-700 placeholder-gray-400 resize-none"
                                        placeholder="Enter comments (each new line will be treated as separate comment)..."
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                                        {postInfo.comments.split('\n').filter(c => c.trim()).length} comments
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-8">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 focus:ring-4 focus:ring-blue-300 focus:outline-none overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {isLoading ? (
                                <div className="relative flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span className="relative">Saving...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="relative p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Save className="w-5 h-5" />
                                    </div>
                                    <span className="relative">Save All Information</span>
                                    <div className="relative ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                                        →
                                    </div>
                                </>
                            )}

                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000">
                                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                            </div>
                        </button>
                    </div>
                </form>

                {/* Footer */}
                <div className="mt-12 text-center text-gray-500 text-sm">
                    <p>All data is securely stored and encrypted</p>
                    <p className="mt-1">© {new Date().getFullYear()} Nexovision AI</p>
                </div>
            </div>
        </div>
    );
};

export default DataPicker;