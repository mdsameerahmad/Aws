import { useEffect, useState } from "react";
import axios from "axios";

const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LevelTreeShow() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openLevel, setOpenLevel] = useState(null);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const token = localStorage.getItem("token"); // Adjust if your auth token key is different
        const res = await axios.get(`${NEXT_PUBLIC_API_URL}/api/auth/leveltree-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLevels(res.data.levels || []);
      } catch (err) {
        console.error("Error fetching level tree:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const toggleLevel = (level) => {
    setOpenLevel(openLevel === level ? null : level);
  };

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h2 className="fw-bold text-primary">Level Users</h2>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : levels.length > 0 ? (
        <div className="accordion" id="levelTreeAccordion">
          {levels.map((level) => (
            <div className="accordion-item" key={level.level}>
              <h2 className="accordion-header" id={`heading-${level.level}`}>
                <button
                  className={`accordion-button ${openLevel === level.level ? "" : "collapsed"}`}
                  type="button"
                  onClick={() => toggleLevel(level.level)}
                >
                  Level {level.level} ({level.users.length} members)
                </button>
              </h2>
              <div
                id={`collapse-${level.level}`}
                className={`accordion-collapse collapse ${openLevel === level.level ? "show" : ""}`}
                aria-labelledby={`heading-${level.level}`}
                data-bs-parent="#levelTreeAccordion"
              >
                <div className="accordion-body p-0">
                  <table className="table table-bordered table-hover text-center align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {level.users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.name || "N/A"}</td>
                          <td>{user.email || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted">No level tree data available</p>
      )}
    </div>
  );
}
