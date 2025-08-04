import { useEffect, useState } from "react";
import api from "../utils/api"; // API Gateway instance
import { Tree, TreeNode } from "react-organizational-chart";

const BinaryTreeNode = ({ node }) => {
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    api
      .get(`/api/wallet/user/${node._id}/wallet`)
      .then((res) => {
        setWallet(res.data || null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          console.warn("Wallet not found for user:", node._id); // expected case, do nothing
          setWallet(null); // leave wallet as null, so "Loading wallet..." is shown or empty
        } else {
          console.error("Wallet fetch error:", err);
          setWallet(null);
        }
      });
  }, [node._id]);

  return (
    <TreeNode
      label={
        <div
          className="card text-center mx-auto"
          style={{
            width: "300px",
            borderRadius: "12px",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            background: "#f8f9fa",
            padding: "10px",
          }}
        >
          <h6 className="fw-bold text-dark mb-1">{node.name}</h6>
          <p className="text-muted small mb-1">{node.email}</p>
          <p className="text-muted small mb-1">ID: {node._id}</p>

          {wallet ? (
            <div className="wallet-info mt-2">
              <p className="mb-0 text-success small">
                💰 Income: ₹{wallet.incomeWallet}
              </p>
              <p className="mb-0 text-primary small">
                📦 Shopping: ₹{wallet.shoppingWallet}
              </p>
              <p className="mb-0 text-primary small">
                 total : {wallet.incomeWallet + wallet.shoppingWallet}
              </p>
              <p className="mb-0 text-warning small">
                🔋 Top-up: ₹{wallet.topupWallet}
              </p>
            </div>
          ) : (
            <p className="text-muted small">No wallet yet</p>
          )}
        </div>
      }
    >
      {node.children?.map((child, i) => (
        <BinaryTreeNode key={i} node={child} />
      ))}
    </TreeNode>
  );
};

export default function BinaryTree({ userId }) {
  const [treeData, setTreeData] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchTreeData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/referral/binary-tree/${userId}`);
        setTreeData(response.data || {});
      } catch (error) {
        console.error('Error fetching tree data:', error);
        setError('Failed to load referral tree. Please try again later.');
        setTreeData({});
      } finally {
        setLoading(false);
      }
    };

    fetchTreeData();
  }, [userId]);

  if (!mounted) return null;
  if (!treeData)
    return <p className="text-muted text-center">Loading tree...</p>;

  return (
    <div className="w-screen h-screen overflow-auto flex justify-center items-start p-6 bg-gray-100">
      <Tree
        label={<BinaryTreeNode node={treeData} />}
        lineWidth={"2px"}
        lineColor={"#6c757d"}
        lineBorderRadius={"10px"}
      />
    </div>
  );
}
