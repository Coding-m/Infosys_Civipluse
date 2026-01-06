import React, { useEffect, useState, useMemo } from "react";
import { Grid, Typography, CircularProgress, Box } from "@mui/material";
import axios from "axios";
import {
  PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import {
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  MapPin,
  LocateFixed
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix leaflet icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const COLORS = ["#2b50ff", "#10b981", "#f97316", "#ef4444", "#8b5cf6", "#ec4899"];

const AdminAnalytics = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const axiosConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8081/api/admin/complaints", axiosConfig);
        setComplaints(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [axiosConfig]);

  const categoryData = useMemo(() => {
    const counts = complaints.reduce((acc, c) => {
      const cat = c.category || "General";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const statusData = useMemo(() => {
    const counts = complaints.reduce((acc, c) => {
      const status = c.status || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [complaints]);

  const trendData = useMemo(() => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const counts = complaints.reduce((acc, c) => {
      const date = c.createdAt ? c.createdAt.split("T")[0] : null;
      if (date && last7Days.includes(date)) {
        acc[date] = (acc[date] || 0) + 1;
      }
      return acc;
    }, {});

    return last7Days.map(date => ({
      name: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
      count: counts[date] || 0
    }));
  }, [complaints]);

  const mapComplaints = useMemo(() => {
    return complaints.filter(c => c.latitude && c.longitude);
  }, [complaints]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
      <CircularProgress thickness={5} size={50} />
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="800" gutterBottom sx={{ mb: 4, color: "var(--text-primary)" }}>
        Strategic Analytics
      </Typography>

      <Grid container spacing={4}>
        {/* Row 1: Trend Chart & Category Breakdown */}
        <Grid item xs={12} lg={6}>
          <Box sx={{
            background: "var(--surface)",
            p: 4,
            borderRadius: "32px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--card-shadow)",
            height: "480px",
            display: "flex",
            flexDirection: "column"
          }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <TrendingUp color="var(--primary)" size={24} />
              <Typography variant="h6" fontWeight="700">7-Day Submission Trend</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }} />
                  <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Box sx={{
            background: "var(--surface)",
            p: 4,
            borderRadius: "32px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--card-shadow)",
            height: "480px",
            display: "flex",
            flexDirection: "column"
          }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <PieIcon color="#f97316" size={24} />
              <Typography variant="h6" fontWeight="700">Category Distribution</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        {/* Row 2: Status Overview & Heatmap */}
        <Grid item xs={12} lg={6}>
          <Box sx={{
            background: "var(--surface)",
            p: 4,
            borderRadius: "32px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--card-shadow)",
            height: "480px",
            display: "flex",
            flexDirection: "column"
          }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <BarChart3 color="#10b981" size={24} />
              <Typography variant="h6" fontWeight="700">Status Overview</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                  <RechartsTooltip cursor={{ fill: "rgba(0,0,0,0.02)" }} />
                  <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={20}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} lg={6}>
          <Box sx={{
            background: "var(--surface)",
            p: 3,
            borderRadius: "32px",
            border: "1px solid var(--border-soft)",
            boxShadow: "var(--card-shadow)",
            height: "480px",
            display: "flex",
            flexDirection: "column"
          }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={2}>
              <LocateFixed color="var(--accent)" size={24} />
              <Typography variant="h6" fontWeight="700">Complaint Hotspots</Typography>
            </Box>
            <Box sx={{ flex: 1, borderRadius: "20px", overflow: "hidden", border: "1px solid var(--border-soft)" }}>
              <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {mapComplaints.map((c) => (
                  <Marker key={c.id} position={[c.latitude, c.longitude]}>
                    <Popup>
                      <div style={{ padding: "5px" }}>
                        <Typography variant="subtitle2" fontWeight="700">{c.title}</Typography>
                        <Typography variant="caption" color="text.secondary">{c.category} • {c.status}</Typography>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalytics;
