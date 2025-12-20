// components/DataPicker.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { User, Phone, MapPin, Briefcase, Calendar, Users, MessageSquare, FileText, Hash, Save, Search, ChevronDown, Plus, X } from 'lucide-react';
import Modal from './Modal/Modal';

const DataPicker = () => {
    const [groups, setGroups] = useState([]);
    const [useCustomGroup, setUseCustomGroup] = useState(false);
    const [personSuggestions, setPersonSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [personDbId, setPersonDbId] = useState(null);
    const [personGroups, setPersonGroups] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showGroupDropdown, setShowGroupDropdown] = useState(false);
    const [showPostSection, setShowPostSection] = useState(false);
    const [groupRecords, setGroupRecords] = useState([]);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showPostModal, setShowPostModal] = useState(false);
    const groupDropdownRef = useRef(null);

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
        e.stopPropagation(); // Prevent event bubbling
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
        e.stopPropagation(); // Prevent event bubbling
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

    const saveGroup = async () => {
    if (!groupInfo.groupName.trim()) {
        alert("Group name is required");
        return;
    }

    if (!personDbId) {
        alert("Please select a person first");
        return;
    }

    try {
        const res = await fetch("/api/groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                personId: personDbId,
                groupName: groupInfo.groupName,
                note: groupInfo.note
            })
        });

        const data = await res.json();

        if (!data.success) {
            throw new Error(data.error || "Failed to save group");
        }

        // ✅ Update local state
        const newGroup = data.group;

        setPersonGroups(prev => [...prev, newGroup]);
        setGroupInfo({
            id: newGroup.id,
            groupName: newGroup.group_name,
            note: groupInfo.note || ""
        });

        setShowGroupModal(false);
        setUseCustomGroup(false);

    } catch (err) {
        console.error("Save group error:", err);
        alert(err.message);
    }
};


    const savePost = async () => {
        if (!postInfo.postDetails.trim()) return alert("Post details required");

        try {
            const res = await fetch("/api/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    personId: personDbId,
                    groupId: groupInfo.id,
                    postDetails: postInfo.postDetails,
                    comments: postInfo.comments
                })
            });

            const data = await res.json();

            if (data.success) {
                setGroupRecords(prev => [data.post, ...prev]);
                setPostInfo({ postDetails: "", comments: "" });
                setShowPostModal(false);
            } else {
                alert("Failed to save post");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        }
    };

    useEffect(() => {
        if (showGroupModal || showPostModal) return;

        const handleMouseDown = (e) => {
            if (
                groupDropdownRef.current &&
                !groupDropdownRef.current.contains(e.target)
            ) {
                setShowGroupDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [showGroupModal, showPostModal]);


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
                                {showSuggestions && !showGroupModal && !showPostModal && personSuggestions.length > 0 && (
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

                                <div>
                                    {personDbId && (


                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowGroupDropdown(false);
                                                setShowSuggestions(false);
                                                setShowGroupModal(true);
                                                setUseCustomGroup(true);
                                            }}
                                            className="inline-flex items-center mr-2 gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                            New Group
                                        </button>
                                    )}


                                    {groupInfo.id && personDbId && (
                                        <button
                                            type="button"
                                            onClick={() => { setShowSuggestions(false); setShowPostModal(true); setShowGroupDropdown(false); }}
                                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl 
        bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium
        hover:from-purple-600 hover:to-pink-700 transition-all shadow-lg"
                                        >
                                            <Plus className="w-4 h-4" />
                                            New Post
                                        </button>
                                    )}


                                </div>
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
                                    {showGroupDropdown && !showGroupModal && !showPostModal && personDbId && (
                                        <div ref={groupDropdownRef} className="fixed md:absolute z-50 w-[calc(100vw-2rem)] md:w-full max-w-[calc(100vw-2rem)] md:max-w-none mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden left-4 md:left-0 md:top-full">
                                            <div
                                                className="overflow-y-auto custom-scrollbar"
                                                style={{ maxHeight: 'min(24rem, 60vh)' }}
                                            >
                                                {personGroups.map(g => (
                                                    <div
                                                        key={g.id}
                                                        onClick={async () => {
                                                            // 1️⃣ Set selected group
                                                            setGroupInfo({
                                                                id: g.id,
                                                                groupName: g.group_name,
                                                                note: g.note || ""
                                                            });

                                                            // 2️⃣ Close dropdown & reset post section
                                                            setShowGroupDropdown(false);
                                                            setUseCustomGroup(false);
                                                            setShowPostSection(false);

                                                            // 3️⃣ Load existing posts for this person + group
                                                            try {
                                                                const res = await fetch(
                                                                    `/api/posts?personId=${personDbId}&groupId=${g.id}`
                                                                );
                                                                const data = await res.json();

                                                                if (data.success) {
                                                                    setGroupRecords(data.posts);
                                                                } else {
                                                                    setGroupRecords([]);
                                                                }
                                                            } catch (err) {
                                                                console.error("Failed to load posts", err);
                                                                setGroupRecords([]);
                                                            }
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

                            {groupRecords.length > 0 && (
                                <div className="mt-6 bg-gray-50 rounded-xl p-4 border">
                                    <h4 className="font-semibold text-gray-700 mb-3">
                                        Existing Posts ({groupRecords.length})
                                    </h4>

                                    <div className="space-y-3 max-h-64 overflow-y-auto">
                                        {groupRecords.map(post => (
                                            <div
                                                key={post.id}
                                                className="p-3 bg-white rounded-lg border shadow-sm"
                                            >
                                                <p className="text-sm text-gray-800">
                                                    {post.post_details}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {new Date(post.created_at).toLocaleString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>

                    {showGroupModal && (
                        <Modal
                            title="Create New Group"
                            onClose={() => {
                                setShowGroupModal(false);
                                setUseCustomGroup(false);
                            }}
                        >
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
                                        className={`w-full px-4 py-3.5 rounded-xl text-gray-700 border-2 ${errors.groupName ? "border-red-400" : "border-green-300"
                                            } focus:ring-4 focus:ring-green-100`}
                                    />
                                    {errors.groupName && (
                                        <p className="text-sm text-red-500">{errors.groupName}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Notes (optional)
                                    </label>
                                    <input
                                        type="text"
                                        name="note"
                                        value={groupInfo.note}
                                        onChange={handleGroupChange}
                                        className="w-full px-4 py-3.5 rounded-xl text-gray-700 border-2 border-green-300 focus:ring-4 focus:ring-green-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowGroupModal(false)}
                                    className="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={saveGroup}
                                    className="px-5 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700"
                                >
                                    Save Group
                                </button>
                            </div>
                        </Modal>
                    )}

                    {showPostModal && (
                        <Modal
                            title="Add New Post"
                            onClose={() => setShowPostModal(false)}
                        >
                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700">
                                        Post Details
                                    </label>
                                    <textarea
                                        name="postDetails"
                                        value={postInfo.postDetails}
                                        onChange={handlePostChange}
                                        rows="4"
                                        className="w-full px-4 py-3 rounded-xl border-2 text-gray-700 border-purple-300 focus:ring-4 focus:ring-purple-100"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700">
                                        Comments
                                    </label>
                                    <textarea
                                        name="comments"
                                        value={postInfo.comments}
                                        onChange={handlePostChange}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl border-2 text-gray-700 border-pink-300 focus:ring-4 focus:ring-pink-100"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setShowPostModal(false)}
                                    className="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={savePost}
                                    className="px-5 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                                >
                                    Save Post
                                </button>
                            </div>
                        </Modal>
                    )}
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