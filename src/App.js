import { useState, useEffect } from "react";
import { HashRouter as Router, Route, Routes, useParams, Link } from "react-router-dom";
import "./App.css";
import usersData from "./data/users.json";
import productsData from "./data/products.json";
import locationsData from "./data/locations.json";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const user = usersData.find((u) => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
      setError("");
    } else {
      setError("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      <input type="text" placeholder="Tên đăng nhập" value={username} onChange={(e) => setUsername(e.target.value)} />
      <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Đăng nhập</button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}

function generateShortID() {
  return Math.random().toString(36).substr(2, 6);
}

function DataEntryForm({ user }) {
  const [product, setProduct] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [link, setLink] = useState("");
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem("entries")) || [];
    const filteredEntries = storedEntries.filter(entry => new Date(entry.expiry) > new Date());
    localStorage.setItem("entries", JSON.stringify(filteredEntries));
    setEntries(filteredEntries);
  }, []);

  const generateLink = () => {
    if (!product || !location || !date) return;
    const id = generateShortID();
    const newLink = `/view/${id}`;
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);

    const entry = {
      id,
      product,
      location,
      date,
      expiry: expiry.toISOString(),
      company: user.company,
      address: user.address,
      packingLocation: user.packingLocation,
      packingAddress: user.packingAddress,
    };

    const updatedEntries = [entry, ...entries].slice(0, 15);
    localStorage.setItem("entries", JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    setLink(newLink);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(window.location.origin + text);
    alert("Đã sao chép link");
  };

  return (
    <div className="container">
      <h2>Nhập thông tin sản phẩm</h2>
      <select onChange={(e) => setProduct(e.target.value)}>
        <option value="">Chọn sản phẩm</option>
        {productsData.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select onChange={(e) => setLocation(e.target.value)}>
        <option value="">Chọn vùng trồng</option>
        {locationsData.map((loc) => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={generateLink} disabled={!product || !location || !date}>Tạo Link</button>
      {link && (
        <div>
          <Link to={link}>Mở Link</Link>
          <button onClick={() => copyToClipboard(link)}>Copy</button>
        </div>
      )}
      <h3>Danh sách link đã tạo</h3>
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            <Link to={`/view/${entry.id}`}>{entry.product} - {entry.date}</Link>
            <button onClick={() => copyToClipboard(`/view/${entry.id}`)}>Copy</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ViewEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem("entries")) || [];
    const foundEntry = storedEntries.find(e => e.id === id);
    setEntry(foundEntry);
  }, [id]);

  if (!entry) return <p>Không tìm thấy dữ liệu</p>;

  return (
    <div className="view-container" style={{ padding: "10px", maxWidth: "100%", overflowX: "auto" }}>
      <h2 style={{ textAlign: "center" }}>{entry.company}</h2>
      <p style={{ textAlign: "center", fontWeight: "bold" }}>{entry.address}</p>
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", width: "100%", minWidth: "300px" }}>
        <tbody>
          <tr><th colSpan="2" style={{ backgroundColor: "#f2f2f2" }}>Thông tin sản phẩm</th></tr>
          <tr><td><strong>Sản phẩm:</strong></td><td>{entry.product}</td></tr>
          <tr><td><strong>Nơi trồng:</strong></td><td>{entry.location}</td></tr>
          <tr><th colSpan="2" style={{ backgroundColor: "#f2f2f2" }}>Thông tin đóng gói</th></tr>
          <tr><td><strong>Ngày đóng gói:</strong></td><td>{entry.date}</td></tr>
          <tr><td><strong>Nơi đóng gói:</strong></td><td>{entry.packingLocation}</td></tr>
          <tr><td><strong>Địa chỉ đóng gói:</strong></td><td>{entry.packingAddress}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <DataEntryForm user={user} /> : <Login onLogin={setUser} />} />
        <Route path="/view/:id" element={<ViewEntry />} />
      </Routes>
    </Router>
  );
}

export default App;
