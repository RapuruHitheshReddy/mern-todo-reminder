// src/pages/Register.js
import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Register = ({ onLogin }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form, { withCredentials: true });

      // Login after register
      await API.post(
        "/auth/login",
        { email: form.email, password: form.password },
        { withCredentials: true }
      );

      toast.success("Registered & logged in");

      if (typeof onLogin === "function") {
        await onLogin();
      }

      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <motion.div
      className="container d-flex justify-content-center align-items-center"
      style={{ minHeight: "90vh" }}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="card p-5 w-100" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-4">
          <i className="bi bi-person-plus-fill me-2 text-primary" />
          Register
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              name="name"
              className="form-control"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 rounded-3">
            <i className="bi bi-check-circle me-2" />
            Register
          </button>
        </form>

        <div className="text-center mt-3">
          <small>
            Already have an account?{" "}
            <Link to="/login" className="text-decoration-underline">
              Login
            </Link>
          </small>
        </div>
      </div>
    </motion.div>
  );
};

export default Register;
