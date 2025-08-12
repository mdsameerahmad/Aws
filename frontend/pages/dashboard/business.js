import { useEffect, useState } from 'react';
import { fetchProfile } from '../../utils/profileService';
import LevelTreeShow from "../../components/LevelTreeShow";
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();  

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function BusinessPage() {
  const [userId, setUserId] = useState(null);
  const [levelStats, setLevelStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [leftTeam, setLeftTeam] = useState(0);
  const [rightTeam, setRightTeam] = useState(0);
  const [leftBusiness, setLeftBusiness] = useState(0);
  const [rightBusiness, setRightBusiness] = useState(0);
  const [matchingBusiness, setMatchingBusiness] = useState(0);

  const [activeView, setActiveView] = useState('direct');

  useEffect(() => {
    const savedUser = localStorage.getItem('userProfileData');
    let foundId = null;

    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed._id) foundId = parsed._id;
      else if (parsed.basicInfo && parsed.basicInfo._id) foundId = parsed.basicInfo._id;
    }

    const fetchBusinessReport = async (uid) => {
      try {
        const res = await axios.get(`${NEXT_PUBLIC_API_URL}/api/income/business/${uid}`);
        const data = res.data || {};

        setLevelStats(Array.isArray(data.levelStats) ? data.levelStats : []);
        setLeftTeam(data.totalLeftUsers || 0);
        setRightTeam(data.totalRightUsers || 0);
        setLeftBusiness(data.totalLeftCarry || 0);
        setRightBusiness(data.totalRightCarry || 0);
        setMatchingBusiness(data.totalMatchingIncome || 0);
      } catch (err) {
        console.error('Error fetching business report:', err);
      } finally {
        setLoading(false);
      }
    };

    if (foundId) {
      setUserId(foundId);
      fetchBusinessReport(foundId);
    } else {
      fetchProfile()
        .then((profile) => {
          const id = profile?.basicInfo?._id;
          if (id) {
            setUserId(id);
            fetchBusinessReport(id);
          }
        })
        .catch((err) => {
          console.error('Failed to fetch profile:', err);
          setLoading(false);
        });
    }
  }, []);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">📊 Business Overview</h2>
      </div>

      {/* Toggle Buttons */}
      <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
        <button
          className={`btn ${activeView === 'direct' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveView('direct')}
        >
          Direct Business
        </button>
        <button
          className={`btn ${activeView === 'total' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveView('total')}
        >
          Total Business
        </button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : activeView === 'total' ? (
        // ✅ TOTAL BUSINESS OVERVIEW
        <div className="card shadow-sm p-4">
          <h5 className="mb-4 fw-semibold">👥 Team & Business Summary</h5>
          <div className="row g-3">
            {/* Left Team */}
            <div className="col-6 col-sm-6 col-md-4 col-lg-2">
              <div className="border rounded p-3 text-center bg-light h-100">
                <h6 className="text-primary">Left Team</h6>
                <h4 className="fw-bold">{leftTeam}</h4>
                <small>Total members</small>
              </div>
            </div>

            {/* Left Business */}
            <div className="col-6 col-sm-6 col-md-4 col-lg-2">
              <div className="border rounded p-3 text-center bg-light h-100">
                <h6 className="text-success">₹ Left Business</h6>
                <h4 className="fw-bold">₹{leftBusiness.toFixed(2)}</h4>
                <small>Total volume</small>
              </div>
            </div>

            {/* Right Team */}
            <div className="col-6 col-sm-6 col-md-4 col-lg-2">
              <div className="border rounded p-3 text-center bg-light h-100">
                <h6 className="text-primary">Right Team</h6>
                <h4 className="fw-bold">{rightTeam}</h4>
                <small>Total members</small>
              </div>
            </div>

            {/* Right Business */}
            <div className="col-6 col-sm-6 col-md-4 col-lg-2">
              <div className="border rounded p-3 text-center bg-light h-100">
                <h6 className="text-success">₹ Right Business</h6>
                <h4 className="fw-bold">₹{rightBusiness.toFixed(2)}</h4>
                <small>Total volume</small>
              </div>
            </div>

            {/* Matching Business */}
            <div className="col-12 col-md-12 col-lg-4">
              <div className="border rounded p-3 text-center bg-light h-100">
                <h6 className="text-info">💼 Matching Business</h6>
                <h4 className="fw-bold">₹{matchingBusiness.toFixed(2)}</h4>
                <small>Total Matching Income</small>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ✅ DIRECT BUSINESS REPORT
        <div className="card shadow-sm p-4">
          <h5 className="mb-3 fw-semibold">📑 Direct Business Report</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-hover text-center align-middle">
              <thead className="table-light">
                <tr>
                  <th>Level</th>
                  <th>Team Count</th>
                  <th>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {levelStats.length > 0 ? (
                  levelStats.map((level) => (
                    <tr key={level.level}>
                      <td>Level {level.level}</td>
                      <td>{level.teamCount}</td>
                      <td>₹{level.commissionEarned?.toFixed(2) || '0.00'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <LevelTreeShow />
    </div>
  );
}
