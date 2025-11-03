"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { normalizeError} from "@/helpers/newErrorHandler";
import { useAppContext } from "@/app/appContext";

export default function AddBikeForm() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    nickname: "",
    make: "",
    model: "",
    color: "",
    pictureUrl: "",
  });
  const [pictureFile, setPictureFile] = useState(null); // File | null

  const { setNavContext, isDarkMode } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    setNavContext('userIn');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] ?? null;
    setPictureFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    setOkMsg("");

    try {
      const data = new FormData();
      data.append("nickname", formData.nickname);
      data.append("make", formData.make);
      data.append("model", formData.model);
      data.append("color", formData.color);

      if (pictureFile) {
        data.append("picture", pictureFile);
      } else if (formData.pictureUrl.trim()) {
        data.append("picture", formData.pictureUrl.trim());
      }

      await axios.post("/api/users/bikes/addBike", data, {
        withCredentials: true,
      });

      setOkMsg("✅ Bike added successfully!");
      setFormData({ nickname: "", make: "", model: "", color: "", pictureUrl: "" });
      setPictureFile(null);
    } catch (err) {
      const findStatus = async () => {
        const { message} = normalizeError(err);
        setErrMsg(message);
      };
      await findStatus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      {errMsg && (
        <div className="mb-4 p-4 border border-red-300 bg-red-50 rounded text-red-700">
          {errMsg}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 p-4 border border-green-300 bg-green-50 rounded text-green-700">
          {okMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label htmlFor="nickname" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Nickname
          </label>
          <input
            id="nickname"
            name="nickname"
            type="text"
            value={formData.nickname}
            onChange={handleChange}
            required
            placeholder="E.g., Commuter, Roadster"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="make" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
              Make
            </label>
            <input
              id="make"
              name="make"
              type="text"
              value={formData.make}
              onChange={handleChange}
              placeholder="Specialized, Trek..."
              className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
            />
          </div>

          <div>
            <label htmlFor="model" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
              Model
            </label>
            <input
              id="model"
              name="model"
              type="text"
              value={formData.model}
              onChange={handleChange}
              placeholder="Sirrus, Domane..."
              className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="color" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Color
          </label>
          <input
            id="color"
            name="color"
            type="text"
            value={formData.color}
            onChange={handleChange}
            required
            placeholder="Blue, matte black…"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
          />
        </div>

        {/* Picture via URL */}
        <div>
          <label htmlFor="pictureUrl" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Picture URL (optional)
          </label>
          <input
            id="pictureUrl"
            name="pictureUrl"
            type="url"
            value={formData.pictureUrl}
            onChange={handleChange}
            placeholder="https://example.com/my-bike.jpg"
            className={`border p-2 w-full rounded placeholder:text-shadow-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? null : "text-gray-900"}`}
          />
        </div>

        {/* OR upload a file */}
        <div>
          <label htmlFor="pictureFile" className={`block mb-2 ${isDarkMode ? null : "text-gray-900"}`}>
            Or upload a picture (optional)
          </label>
          <input
            id="pictureFile"
            name="pictureFile"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={`block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700 ${isDarkMode ? null : "text-gray-900"}`}
          />
          <p className={`text-xs mt-1 ${isDarkMode ? null : "text-gray-900"}`}>
            If both URL and file are provided, the file will be used.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Adding..." : "Add Bike"}
        </button>
      </form>
    </>
  );
}
