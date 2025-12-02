// @ts-nocheck
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { BarChart, PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, Pie } from "recharts";
import SidebarLayout from "../components/SidebarLayout";
import { GLOBAL_STYLES, COLORS } from "../lib/globalStyles";
import api from "../lib/api";

const screenWidth = Dimensions.get("window").width;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResidents: 0,
    totalWorkers: 0,
    totalCertificates: 0,
    totalSummons: 0,
    maleCount: 0,
    femaleCount: 0,
    otherCount: 0,
    fourPsCount: 0,
    seniorCitizenCount: 0,
    pwdCount: 0,
    soloParentCount: 0,
    ageDistribution: [],
    incomeDistribution: [],
    recentResidents: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [residentsRes, certificatesRes, summonsRes] = await Promise.all([
        api.get("/residents"),
        api.get("/certificates"),
        api.get("/summons"),
      ]);

      const residents = residentsRes.data || [];
      const certificates = certificatesRes.data?.data || certificatesRes.data || [];
      const summons = summonsRes.data?.data || summonsRes.data || [];

      const totalResidents = residents.length;
      const totalWorkers = residents.filter(r => r.occupation && r.occupation.trim() !== "").length;
      const totalCertificates = Array.isArray(certificates) ? certificates.length : 0;
      const totalSummons = Array.isArray(summons) ? summons.length : 0;

      const maleCount = residents.filter(r => r.gender === "Male").length;
      const femaleCount = residents.filter(r => r.gender === "Female").length;
      const otherCount = residents.filter(r => r.gender === "Other").length;

      const fourPsCount = residents.filter(r => r.beneficiaryStatus === "4Ps").length;
      const seniorCitizenCount = residents.filter(r => r.beneficiaryStatus === "Senior Citizen").length;
      const pwdCount = residents.filter(r => r.beneficiaryStatus === "PWD").length;
      const soloParentCount = residents.filter(r => r.beneficiaryStatus === "Solo Parent").length;

      const ageGroups = {
        "0-17": 0,
        "18-30": 0,
        "31-45": 0,
        "46-60": 0,
        "60+": 0,
      };

      residents.forEach(r => {
        const age = r.age;
        if (!age) return;
        if (age <= 17) ageGroups["0-17"]++;
        else if (age <= 30) ageGroups["18-30"]++;
        else if (age <= 45) ageGroups["31-45"]++;
        else if (age <= 60) ageGroups["46-60"]++;
        else ageGroups["60+"]++;
      });

      const ageDistribution = Object.entries(ageGroups).map(([range, count]) => ({
        range,
        count,
      }));

      const incomeGroups = {
        "No Income": 0,
        "Indigent": 0,
        "Poor": 0,
        "Low": 0,
        "Lower Mid": 0,
        "Middle": 0,
        "Upper Mid": 0,
        "High": 0,
      };

      residents.forEach(r => {
        const income = r.monthlyIncome || 0;
        if (income <= 0) incomeGroups["No Income"]++;
        else if (income <= 5000) incomeGroups["Indigent"]++;
        else if (income <= 12000) incomeGroups["Poor"]++;
        else if (income <= 20000) incomeGroups["Low"]++;
        else if (income <= 40000) incomeGroups["Lower Mid"]++;
        else if (income <= 60000) incomeGroups["Middle"]++;
        else if (income <= 100000) incomeGroups["Upper Mid"]++;
        else incomeGroups["High"]++;
      });

      const incomeDistribution = Object.entries(incomeGroups).map(([range, count]) => ({
        range,
        count,
      }));

      const recentResidents = residents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalResidents,
        totalWorkers,
        totalCertificates,
        totalSummons,
        maleCount,
        femaleCount,
        otherCount,
        fourPsCount,
        seniorCitizenCount,
        pwdCount,
        soloParentCount,
        ageDistribution,
        incomeDistribution,
        recentResidents,
      });
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SidebarLayout>
    );
  }

  // Gender Pie Chart Data for Recharts
  const genderPieData = [
    { name: "Male", value: stats.maleCount, color: "#3b82f6" },
    { name: "Female", value: stats.femaleCount, color: "#ec4899" },
    ...(stats.otherCount > 0 ? [{ name: "Other", value: stats.otherCount, color: "#8b5cf6" }] : []),
  ];

  // Beneficiaries Pie Chart Data for Recharts
  const beneficiariesPieData = [
    { name: "4Ps", value: stats.fourPsCount, color: "#10b981" },
    { name: "Senior Citizens", value: stats.seniorCitizenCount, color: "#f59e0b" },
    { name: "PWD", value: stats.pwdCount, color: "#6366f1" },
    { name: "Solo Parents", value: stats.soloParentCount, color: "#8b5cf6" },
  ].filter(item => item.value > 0);

  return (
    <SidebarLayout>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Page Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Dashboard</Text>
          <Text style={styles.pageSubtitle}>Barangay Analytics & Statistics</Text>
        </View>

        {/* Summary Cards - Clean Design */}
        <View style={styles.cardsGrid}>
          <StatCard
            title="Total Residents"
            value={stats.totalResidents}
            icon="👥"
            bgColor="#eff6ff"
            iconColor="#3b82f6"
            textColor="#1e40af"
          />
          <StatCard
            title="Employed Workers"
            value={stats.totalWorkers}
            icon="💼"
            bgColor="#f0fdf4"
            iconColor="#10b981"
            textColor="#166534"
          />
          <StatCard
            title="Certificates"
            value={stats.totalCertificates}
            icon="📄"
            bgColor="#fffbeb"
            iconColor="#f59e0b"
            textColor="#b45309"
          />
          <StatCard
            title="Summons"
            value={stats.totalSummons}
            icon="📋"
            bgColor="#fef2f2"
            iconColor="#ef4444"
            textColor="#b91c1c"
          />
        </View>

        <View style={styles.cardsGrid}>
          <StatCard
            title="4Ps Beneficiaries"
            value={stats.fourPsCount}
            icon="🏠"
            bgColor="#f0fdf4"
            iconColor="#10b981"
            textColor="#166534"
          />
          <StatCard
            title="Senior Citizens"
            value={stats.seniorCitizenCount}
            icon="👴"
            bgColor="#fff7ed"
            iconColor="#f59e0b"
            textColor="#b45309"
          />
          <StatCard
            title="PWD"
            value={stats.pwdCount}
            icon="♿"
            bgColor="#eef2ff"
            iconColor="#6366f1"
            textColor="#4338ca"
          />
          <StatCard
            title="Solo Parents"
            value={stats.soloParentCount}
            icon="👨‍👧"
            bgColor="#faf5ff"
            iconColor="#8b5cf6"
            textColor="#6b21a8"
          />
        </View>

        {/* Charts in 2 Columns - Better Spacing */}
        <View style={styles.chartsRow}>
          {/* Gender Distribution */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Gender Distribution</Text>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={genderPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {genderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <View style={styles.statsColumn}>
              <StatItem label="Male" value={stats.maleCount} color="#3b82f6" />
              <StatItem label="Female" value={stats.femaleCount} color="#ec4899" />
              {stats.otherCount > 0 && (
                <StatItem label="Other" value={stats.otherCount} color="#8b5cf6" />
              )}
            </View>
          </View>

          {/* Beneficiaries Distribution */}
          {beneficiariesPieData.length > 0 && (
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Beneficiary Programs</Text>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={beneficiariesPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {beneficiariesPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <View style={styles.statsColumn}>
                {stats.fourPsCount > 0 && <StatItem label="4Ps" value={stats.fourPsCount} color="#10b981" />}
                {stats.seniorCitizenCount > 0 && <StatItem label="Senior Citizens" value={stats.seniorCitizenCount} color="#f59e0b" />}
                {stats.pwdCount > 0 && <StatItem label="PWD" value={stats.pwdCount} color="#6366f1" />}
                {stats.soloParentCount > 0 && <StatItem label="Solo Parents" value={stats.soloParentCount} color="#8b5cf6" />}
              </View>
            </View>
          )}
        </View>

        {/* Age and Income Distribution */}
        <View style={styles.chartsRow}>
          {/* Age Distribution */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Age Distribution</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.ageDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </View>

          {/* Income Distribution */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Income Distribution</Text>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={stats.incomeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#10b981" name="Residents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </View>
        </View>

        {/* Recent Residents */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Recently Added Residents</Text>
          {stats.recentResidents.map((resident, index) => (
            <View key={resident._id || index} style={styles.recentItem}>
              <View style={styles.recentInfo}>
                <Text style={styles.recentName}>
                  {[resident.firstName, resident.middleName, resident.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </Text>
                <Text style={styles.recentDetails}>
                  {resident.gender} • {resident.age ? `${resident.age} years old` : "Age N/A"} • Purok {resident.purok || "N/A"}
                </Text>
              </View>
              <View style={styles.recentBadge}>
                <Text style={styles.recentBadgeText}>New</Text>
              </View>
            </View>
          ))}
          {stats.recentResidents.length === 0 && (
            <Text style={styles.emptyText}>No recent residents</Text>
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </SidebarLayout>
  );
}

// Reusable Components
function StatCard({ title, value, icon, bgColor, iconColor, textColor }) {
  const formattedValue =
    typeof value === "number"
      ? value.toLocaleString()
      : value != null
      ? String(value)
      : "0";

  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <View style={[styles.iconCircle, { backgroundColor: iconColor + "20" }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: textColor }]}>{formattedValue}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

function StatItem({ label, value, color }) {
  return (
    <View style={styles.statItem}>
      <View style={[styles.statDot, { backgroundColor: color }]} />
      <Text style={styles.statItemLabel}>{label}</Text>
      <Text style={styles.statItemValue}>{value}</Text>
    </View>
  );
}

// Styles
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  pageHeader: {
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  cardsGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: 240,
    padding: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 28,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  chartsRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 20,
  },
  chartCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 28,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 24,
  },
  statsColumn: {
    gap: 12,
    marginTop: 20,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 10,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statItemLabel: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "600",
    flex: 1,
  },
  statItemValue: {
    fontSize: 16,
    color: "#0f172a",
    fontWeight: "700",
  },
  recentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    marginBottom: 12,
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 6,
  },
  recentDetails: {
    fontSize: 14,
    color: "#64748b",
  },
  recentBadge: {
    backgroundColor: "#10b981",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recentBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 14,
    paddingVertical: 32,
  },
};