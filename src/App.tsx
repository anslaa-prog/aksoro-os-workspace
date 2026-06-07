// @ts-nocheck
import React, { useState, useEffect, useMemo } from "react";
import logoAksoro from '/logo-aksoro.png';
import {
  LayoutGrid,
  Users,
  CheckSquare,
  History,
  TrendingUp,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Calendar,
  MoreVertical,
  Lock,
  Shield,
  Activity,
  Check,
  AlertCircle,
  Clock,
  ArrowRight,
  Search,
  Building2,
  ChevronDown,
  Sparkles,
  CloudLightning,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

// Import modular Firebase SDKs
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPYx8TRLzaoeajBix4CtiE34KEnZOz1PY",
  authDomain: "aksoro-os-workspace.firebaseapp.com",
  projectId: "aksoro-os-workspace",
  storageBucket: "aksoro-os-workspace.firebasestorage.app",
  messagingSenderId: "86930754052",
  appId: "1:86930754052:web:3ba135ca73d211a57b0351"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Y = "#ffeb00"; // Signature Aksoro Yellow
const YD = "#d99e00"; // Rich honey gold/yellow for soft contrast
const BK = "#291a0c"; // Warm velvet espresso-bronze
const WH = "#ffffff"; // Clean white

const PCOL = {
  High: { bg: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/40", col: "#ef4444" },
  Medium: { bg: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/40", col: "#f59e0b" },
  Low: { bg: "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100/40", col: "#10b981" }
};

const DIVS = [
  "CEO Office",
  "People",
  "Marketing",
  "Sales & Service",
  "FAT",
  "Product & Partnership",
  "Business",
  "Event & Operations"
];

const COLS = ["To-Do", "Ongoing", "Need Approval", "Done", "Pending"];

const gE = p => p <= 10 ? "🐢" : p <= 40 ? "🏃🏻" : p <= 70 ? "🏎️" : p < 100 ? "🚀" : "🏆";

const nowTs = () => new Date().toLocaleString("id-ID", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit"
});

const todayISO = () => new Date().toISOString().slice(0, 10);

const genPw = () => {
  const c = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#";
  return Array.from({ length: 10 }, () => c[Math.floor(Math.random() * c.length)]).join("");
};

const AksoroLogo = () => {
  return (
    <div className="relative inline-block select-none">
      <img 
        src={logoAksoro}
        alt="Aksoro Business School" 
        style={{ maxWidth: '140px', width: '100%', height: 'auto' }}
        className="mx-auto block hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

const AksoroLogoSmall = () => (
  <div className="inline-flex items-center select-none shrink-0">
    <div className="flex items-center gap-2">
      <img 
        src={logoAksoro} 
        alt="Aksoro Logo" 
        className="h-8 w-auto object-contain block hover:scale-105 transition-transform duration-300"
      />
      <span className="font-extrabold text-sm tracking-tight text-[#291a0c] hidden sm:inline">Aksoro OS</span>
    </div>
  </div>
);

const USERS0 = [
  { id: 1, name: "Annisa Salsabila", username: "annisalsa", role: "super_admin", division: "People", opRole: "team_member", opDivision: "People", active: true, avatar: "AS", password: "SuperAdminAksoro2026!" },
];

const buildTasks = () => {
  const td = todayISO();
  return [].map(t => ({
    ...t,
    logs: [{ user: "System", action: "Created task baseline", ts: "Jun 1, 09:00" }]
  }));
};

const calcDaily = myTasks => {
  if (!myTasks || !myTasks.length) return 0;
  return Math.min(100, Math.round((myTasks.filter(t => t.status === "Done").length / myTasks.length) * 100));
};

const carryOver = list => {
  const t = todayISO();
  return list.map(tk => {
    if (tk.status === "Done" || tk.status === "Pending" || !tk.due) return tk;
    if (tk.due < t) {
      return {
        ...tk,
        status: "Pending",
        logs: [...tk.logs, { user: "System", action: "Automatically set to Pending due to date roll-over", ts: nowTs() }]
      };
    }
    return tk;
  });
};

const canMove = (role, from, to) => {
  if (!role || role === "super_admin") return true; 
  if (to === from || !COLS.includes(to)) return false;
  return true;
};

const todayLabel = () => new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric"
});

let firebaseDb: any = null;
let firebaseAuth: any = null;
let isFirebaseActive = false;
let globalAppId = "default-app-id";

try {
  if (typeof window !== "undefined" && window.__firebase_config) {
    const config = JSON.parse(window.__firebase_config);
    globalAppId = typeof window.__app_id !== "undefined" ? window.__app_id : "aksoro-workspace-pos";
    const app = initializeApp(config);
    firebaseAuth = getAuth(app);
    firebaseDb = getFirestore(app);
    isFirebaseActive = true;
  }
} catch (e) {
  console.warn("Koneksi Firebase gagal dimuat. Menggunakan mode luring lokal.", e);
}

export default function App() {
  const [users, setUsers] = useState<any[]>(() => {
    const saved = localStorage.getItem("ak_users");
    return saved ? JSON.parse(saved) : USERS0;
  });

  const [tasks, setTasks] = useState<any[]>(() => {
    const saved = localStorage.getItem("ak_tasks");
    return saved ? JSON.parse(saved) : carryOver(buildTasks());
  });

  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem("ak_curr_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [authUser, setAuthUser] = useState<any>(null);
  const [syncStatus, setSyncStatus] = useState<"offline" | "connecting" | "live" | "error">("offline");

  useEffect(() => {
    if (!isFirebaseActive) {
      setSyncStatus("offline");
      return;
    }

    const startAuth = async () => {
      setSyncStatus("connecting");
      try {
        if (typeof window !== "undefined" && window.__initial_auth_token) {
          await signInWithCustomToken(firebaseAuth, window.__initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }
      } catch (err) {
        console.error("Firebase authentication failed:", err);
        setSyncStatus("error");
      }
    };

    startAuth();

    const unsubscribe = onAuthStateChanged(firebaseAuth, (usr) => {
      setAuthUser(usr);
      if (usr) {
        setSyncStatus("live");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseActive || !authUser) return;

    const tasksCollectionRef = collection(firebaseDb, "artifacts", globalAppId, "public", "data", "tasks");
    const usersCollectionRef = collection(firebaseDb, "artifacts", globalAppId, "public", "data", "users");

    const unsubscribeTasks = onSnapshot(
      tasksCollectionRef,
      (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
          items.push({ ...doc.data() });
        });
        
        if (items.length === 0) {
          const baselineTasks = carryOver(buildTasks());
          baselineTasks.forEach((t) => {
            setDoc(doc(firebaseDb, "artifacts", globalAppId, "public", "data", "tasks", String(t.id)), t);
          });
          setTasks(baselineTasks);
        } else {
          setTasks(items);
        }
        setSyncStatus("live");
      },
      (error) => {
        console.error("Firestore Tasks Sync Error:", error);
        setSyncStatus("error");
      }
    );

    const unsubscribeUsers = onSnapshot(
      usersCollectionRef,
      (snapshot) => {
        const items: any[] = [];
        snapshot.forEach((doc) => {
          items.push({ ...doc.data() });
        });

        if (items.length === 0) {
          USERS0.forEach((u) => {
            setDoc(doc(firebaseDb, "artifacts", globalAppId, "public", "data", "users", String(u.id)), u);
          });
          setUsers(USERS0);
        } else {
          setUsers(items);
        }
      },
      (error) => {
        console.error("Firestore Users Sync Error:", error);
      }
    );

    return () => {
      unsubscribeTasks();
      unsubscribeUsers();
    };
  }, [authUser]);

  useEffect(() => {
    if (syncStatus === "offline" || syncStatus === "error") {
      localStorage.setItem("ak_users", JSON.stringify(users));
    }
  }, [users, syncStatus]);

  useEffect(() => {
    if (syncStatus === "offline" || syncStatus === "error") {
      localStorage.setItem("ak_tasks", JSON.stringify(tasks));
    }
  }, [tasks, syncStatus]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("ak_curr_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("ak_curr_user");
    }
  }, [user]);

  const [adminCtx, setAdminCtx] = useState("console"); 
  const [adminTab, setAdminTab] = useState("overview"); 
  const [opMode, setOpMode] = useState("my_tasks"); 
  const [selDiv, setSelDiv] = useState("Marketing");
  const [view, setView] = useState("board"); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("All");
  
  const [histRange, setHistRange] = useState("week");
  const [histFrom, setHistFrom] = useState("");
  const [histTo, setHistTo] = useState("");

  const [loginUser, setLoginUser] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginErr, setLoginErr] = useState("");

  const [taskModalId, setTaskModalId] = useState<any>(null);
  const [editTaskModal, setEditTaskModal] = useState<any>(null);
  const [menuOpenId, setMenuOpenId] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [editUModal, setEditUModal] = useState<any>(null);
  const [addUModal, setAddUModal] = useState(false);
  const [creds, setCreds] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const [deleteTaskConfirmId, setDeleteTaskConfirmId] = useState<any>(null);
  
  const [dragTask, setDragTask] = useState<any>(null);
  const [dragOver, setDragOver] = useState<any>(null);
  
  const [nt, setNt] = useState({ title: "", priority: "Medium", due: "", notes: "", assign_to: "self" });
  const [nu, setNu] = useState({ name: "", username: "", role: "team_member", division: "Marketing", active: true });

  useEffect(() => {
    if (!menuOpenId) return;
    const h = () => setMenuOpenId(null);
    document.addEventListener("click", h);
    return () => document.removeEventListener("click", h);
  }, [menuOpenId]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const isAdmin = user?.role === "super_admin";
  const isLeader = user?.role === "team_leader";
  const isMember = user?.role === "team_member";
  
  const inConsole = isAdmin && adminCtx === "console";
  const inMonitor = isAdmin && adminCtx === "monitoring";
  const inOpWS = isAdmin && adminCtx === "operational";
  const hasOpRole = isAdmin && !!user?.opRole && !!user?.opDivision;
  
  // FIX: Fallback effRole & activeDiv for Super Admin so their board doesn't crash to Null
  const effRole = inOpWS 
    ? (user?.opRole || "team_leader") 
    : isLeader 
      ? "team_leader" 
      : isMember 
        ? "team_member" 
        : isAdmin 
          ? (user?.opRole || "team_leader") 
          : null;

  const activeDiv = inMonitor 
    ? selDiv 
    : inOpWS 
      ? (user?.opDivision || "Marketing") 
      : (user?.division || selDiv);

  const isLdrCtx = effRole === "team_leader" || isAdmin;
  const isMemberTeamBoard = (isMember || (isAdmin && effRole === "team_member")) && opMode === "team_board";

  // FIX: Include Super Admins in Division Members/Leaders lists based on opRole/fallback
  const membersOf = d => users.filter(u => 
    u.active && 
    u.division === d && 
    (u.role === "team_member" || (u.role === "super_admin" && u.opRole === "team_member"))
  );

  const leadersOf = d => users.filter(u => 
    u.active && 
    u.division === d && 
    (u.role === "team_leader" || (u.role === "super_admin" && u.opRole !== "team_member"))
  );

  const doLogin = () => {
    setLoginErr("");
    const found = users.find(u => u.username.toLowerCase() === loginUser.toLowerCase() && u.password === loginPw && u.active);
    if (!found) {
      setLoginErr("Username atau password salah.");
      return;
    }
    setUser(found);
    if (found.role === "super_admin") {
      setAdminCtx("console");
      setAdminTab("overview");
    } else if (found.division) {
      setSelDiv(found.division);
    }
    setOpMode("my_tasks");
    setView("board");
    showToast(`Welcome back, ${found.name}!`);
  };

  const handleSaveTask = async (taskObj) => {
    if (isFirebaseActive && authUser) {
      try {
        const taskDocRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "tasks", String(taskObj.id));
        await setDoc(taskDocRef, taskObj);
      } catch (err) {
        console.error("Gagal menyimpan task ke cloud:", err);
      }
    } else {
      setTasks(prev => prev.map(t => t.id === taskObj.id ? taskObj : t));
    }
  };

  const doMove = (task, to) => {
    if (!canMove(effRole, task.status, to)) {
      showToast("Anda tidak memiliki hak untuk memindahkan task ini", "error");
      return;
    }
    const log = { user: user.name, action: `Moved from ${task.status} to ${to}`, ts: nowTs() };
    const newProg = to === "Done" ? 100 : task.progress;
    
    const updated = { ...task, status: to, progress: newProg, logs: [...task.logs, log] };
    handleSaveTask(updated);

    showToast(`Task dipindahkan ke ${to}`);
    setTaskModalId(null);
  };

  const doDeleteTask = async taskId => {
    if (isFirebaseActive && authUser) {
      try {
        const taskDocRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "tasks", String(taskId));
        await deleteDoc(taskDocRef);
      } catch (err) {
        console.error("Gagal menghapus task dari cloud:", err);
      }
    } else {
      setTasks(prev => prev.filter(t => t.id !== taskId));
    }
    setMenuOpenId(null);
    showToast("Task berhasil dihapus");
  };

  const doSaveEditTask = () => {
    if (!editTaskModal || !editTaskModal.title.trim()) return;
    const log = { user: user.name, action: "Task edited", ts: nowTs() };
    
    const updated = { 
      ...editTaskModal,
      title: editTaskModal.title, 
      priority: editTaskModal.priority, 
      due: editTaskModal.due, 
      notes: editTaskModal.notes, 
      logs: [...(editTaskModal.logs || []), log] 
    };

    handleSaveTask(updated);
    setEditTaskModal(null);
    showToast("Perubahan task disimpan!");
  };

  const doAddTask = async () => {
    if (!nt.title.trim()) return;
    const div = inOpWS ? user.opDivision : selDiv;
    const aId = isLdrCtx && nt.assign_to !== "self" ? Number(nt.assign_to) : user.id;
    const aName = users.find(u => u.id === aId)?.name || "";

    const newTaskObj = {
      id: Date.now(),
      title: nt.title,
      division: div,
      status: "To-Do",
      priority: nt.priority,
      progress: 0,
      assignee: aId,
      created_by: user.id,
      due: nt.due,
      notes: nt.notes,
      logs: [{ user: user.name, action: aId !== user.id ? `Created & assigned to ${aName}` : "Created", ts: nowTs() }]
    };
    
    if (isFirebaseActive && authUser) {
      try {
        const docRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "tasks", String(newTaskObj.id));
        await setDoc(docRef, newTaskObj);
      } catch (err) {
        console.error("Gagal membuat task baru di cloud:", err);
      }
    } else {
      setTasks(prev => [...prev, newTaskObj]);
    }

    setAddModal(false);
    setNt({ title: "", priority: "Medium", due: "", notes: "", assign_to: "self" });
    showToast("Task berhasil dibuat!");
  };

  const doSaveUser = async u => {
    if (u.id) {
      if (isFirebaseActive && authUser) {
        try {
          const userDocRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "users", String(u.id));
          await setDoc(userDocRef, u);
        } catch (err) {
          console.error("Gagal update user di cloud:", err);
        }
      } else {
        setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x));
      }
      setEditUModal(null);
      showToast("Informasi user berhasil diperbarui");
    } else {
      const av2 = u.name.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase();
      const pw = genPw();
      const newU = { ...u, id: Date.now(), avatar: av2, password: pw };
      
      if (isFirebaseActive && authUser) {
        try {
          const userDocRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "users", String(newU.id));
          await setDoc(userDocRef, newU);
        } catch (err) {
          console.error("Gagal mendaftarkan user baru di cloud:", err);
        }
      } else {
        setUsers(prev => [...prev, newU]);
      }

      setCreds({ name: u.name, username: u.username, password: pw });
      setAddUModal(false);
      setNu({ name: "", username: "", role: "team_member", division: "Marketing", active: true });
      showToast("User baru berhasil dibuat!");
    }
  };

  const toggleUserActiveState = async (u) => {
    const updated = { ...u, active: !u.active };
    if (isFirebaseActive && authUser) {
      try {
        const userDocRef = doc(firebaseDb, "artifacts", globalAppId, "public", "data", "users", String(u.id));
        await setDoc(userDocRef, updated);
      } catch (err) {
        console.error("Gagal update status user di cloud:", err);
      }
    } else {
      setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
    }
    showToast(`${u.name} status updated!`);
  };

  const onDrop = col => {
    if (isMemberTeamBoard) return;
    if (dragTask) doMove(dragTask, col);
    setDragTask(null);
    setDragOver(null);
  };

  const divTasks = useMemo(() => tasks.filter(t => t.division === activeDiv), [tasks, activeDiv]);

  const boardTasks = useMemo(() => {
    let base = [];
    if (inMonitor) {
      base = tasks.filter(t => t.division === selDiv);
    } else if (inOpWS) {
      if (effRole === "team_leader") {
        base = opMode === "my_tasks" ? divTasks.filter(t => t.assignee === user.id) : divTasks;
      } else {
        base = divTasks.filter(t => t.assignee === user.id);
      }
    } else if (isMember) {
      base = opMode === "team_board" ? divTasks : divTasks.filter(t => t.assignee === user.id);
    } else if (isLeader) {
      base = opMode === "my_tasks" ? divTasks.filter(t => t.assignee === user.id) : divTasks;
    } else if (isAdmin) {
      // FIX: Super Admin fallbacks for division Kanban Boards outside Op Portal
      if (effRole === "team_leader") {
        base = opMode === "my_tasks" ? divTasks.filter(t => t.assignee === user.id) : divTasks;
      } else {
        base = opMode === "team_board" ? divTasks : divTasks.filter(t => t.assignee === user.id);
      }
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      base = base.filter(t => t.title.toLowerCase().includes(q) || (t.notes && t.notes.toLowerCase().includes(q)));
    }

    if (filterPriority !== "All") {
      base = base.filter(t => t.priority === filterPriority);
    }

    return base;
  }, [inMonitor, inOpWS, effRole, opMode, divTasks, selDiv, tasks, user, isMember, isLeader, isAdmin, searchQuery, filterPriority]);

  const myTasks = useMemo(() => (user ? tasks.filter(t => t.assignee === user.id) : []), [tasks, user]);
  
  const showDash = !!((isLeader && opMode === "team_board") || (inOpWS && effRole === "team_leader" && opMode === "team_board") || inMonitor || isAdmin);
  const canAdd = (inOpWS || isLeader || isMember || isAdmin) && !inMonitor && !isMemberTeamBoard;
  const isTeamView = (isLeader && opMode === "team_board") || (inOpWS && effRole === "team_leader" && opMode === "team_board") || (isAdmin && opMode === "team_board");

  const histList = useMemo(() => {
    const now = new Date();
    let since = "2000-01-01";
    let until = todayISO();
    
    if (histRange === "day") {
      const d = new Date(now);
      d.setDate(d.getDate() - 1);
      since = d.toISOString().slice(0, 10);
    } else if (histRange === "week") {
      const d = new Date(now);
      d.setDate(d.getDate() - 7);
      since = d.toISOString().slice(0, 10);
    } else if (histRange === "month") {
      const d = new Date(now);
      d.setMonth(d.getMonth() - 1);
      since = d.toISOString().slice(0, 10);
    } else if (histRange === "year") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      since = d.toISOString().slice(0, 10);
    } else if (histRange === "custom") {
      since = histFrom || "2000-01-01";
      until = histTo || todayISO();
    }
    
    const base = isMemberTeamBoard ? divTasks : boardTasks;
    return base.filter(t => t.status === "Done" && (!t.due || (t.due >= since && t.due <= until)));
  }, [histRange, histFrom, histTo, isMemberTeamBoard, divTasks, boardTasks]);

  const roleChip = role => {
    let col = "bg-amber-50 text-amber-700 border-amber-200";
    let label = "Member";
    if (role === "super_admin") {
      col = "bg-[#291a0c] text-[#ffeb00] border-neutral-900";
      label = "Super Admin";
    } else if (role === "team_leader") {
      col = "bg-orange-50 text-orange-700 border-orange-200";
      label = "Leader";
    }
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${col}`}>{label}</span>;
  };

  const progressLine = (val) => {
    const isDone = val === 100;
    const isMid = val > 40;
    const bgGrad = isDone 
      ? "from-emerald-500 to-teal-500" 
      : isMid 
        ? "from-amber-400 to-[#ffeb00]" 
        : "from-orange-500 to-amber-500";
    
    return (
      <div className="h-2.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/40">
        <div 
          className={`h-full bg-gradient-to-r ${bgGrad} rounded-full transition-all duration-500`}
          style={{ width: `${val}%` }}
        />
      </div>
    );
  };

  const dailyProgressBar = (pct, label, avatar, description = "Today's Target Velocity") => {
    const emoji = gE(pct);
    const flip = emoji === "🏃🏻" || emoji === "🏎️";
    
    let barColorClass = "from-red-800 via-red-600 to-red-500"; 
    
    if (pct > 20 && pct <= 50) {
      barColorClass = "from-red-700 via-red-500 to-orange-500";
    } else if (pct > 50 && pct <= 80) {
      barColorClass = "from-red-700 via-orange-500 to-amber-400";
    } else if (pct > 80) {
      barColorClass = "from-red-700 via-amber-400 to-emerald-700";
    }
    
    return (
      <div className="w-full bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ffeb00]" />
        
        <div className="flex items-center gap-3 pl-1.5">
          {avatar && (
            <div className="w-10 h-10 rounded-full bg-[#291a0c] border-2 border-[#ffeb00] flex items-center justify-center font-bold text-xs text-[#ffeb00] shadow-sm shrink-0">
              {avatar}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {label && (
              <div className="text-[13px] font-bold text-neutral-800 flex items-baseline justify-between">
                <span className="truncate">{label}</span>
                <span className="text-[10px] text-neutral-400 font-medium tracking-normal">{description}</span>
              </div>
            )}
            
            <div className="relative h-3 bg-neutral-100 border border-neutral-200/50 rounded-full mt-4 mb-2 overflow-visible">
              <div 
                className={`h-full bg-gradient-to-r ${barColorClass} rounded-full transition-all duration-700 relative min-w-[20px]`}
                style={{ width: `${pct}%` }}
              >
                {pct > 5 && pct < 95 && (
                  <span 
                    className={`absolute right-1 top-1/2 -translate-y-1/2 text-[14px] select-none pointer-events-none transform scale-150 origin-center ${flip ? "scale-x-[-1.5]" : ""}`}
                  >
                    {emoji}
                  </span>
                )}
              </div>
              {pct >= 95 && (
                <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[14px] select-none pointer-events-none transform scale-150 origin-center">
                  {emoji}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-neutral-500 font-semibold mt-1">
              <span>0%</span>
              <span className="bg-[#291a0c] text-[#ffeb00] px-2 py-0.5 rounded text-[10px] font-bold">{pct}% Selesai</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center font-sans antialiased relative overflow-hidden py-10 px-4">
        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-amber-100/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#ffeb00]/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-amber-400/5 blur-[90px] pointer-events-none" />
        
        <div className="w-full max-w-[420px] relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4 transition-transform hover:scale-105 duration-300">
              <AksoroLogo />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#291a0c] text-white text-[11px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#ffeb00] animate-pulse" />
              Productivity Operating System
            </div>
            <h1 className="text-2xl font-black text-neutral-800 tracking-tight">Aksoro OS</h1>
            <p className="text-xs text-neutral-500 mt-1">Sistem Kolaborasi & Manajemen Kinerja Terintegrasi</p>
          </div>

          <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 shadow-xl shadow-neutral-100">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">Username</label>
                <input 
                  className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-[#ffeb00] focus:ring-1 focus:ring-[#ffeb00] rounded-xl py-3 px-4 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all"
                  type="text" 
                  placeholder="Masukkan username" 
                  value={loginUser} 
                  onChange={e => { setLoginUser(e.target.value); setLoginErr(""); }}
                  onKeyDown={e => e.key === "Enter" && doLogin()}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full bg-neutral-50 hover:bg-neutral-100/50 focus:bg-white border border-neutral-200 focus:border-[#ffeb00] focus:ring-1 focus:ring-[#ffeb00] rounded-xl py-3 px-4 pr-12 text-sm text-neutral-900 placeholder-neutral-400 outline-none transition-all"
                    type={showPw ? "text" : "password"} 
                    placeholder="••••••••••" 
                    value={loginPw} 
                    onChange={e => { setLoginPw(e.target.value); setLoginErr(""); }}
                    onKeyDown={e => e.key === "Enter" && doLogin()}
                  />
                  <button 
                    onClick={() => setShowPw(v => !v)} 
                    tabIndex={-1} 
                    className="absolute right-3 p-1.5 text-neutral-400 hover:text-[#291a0c] transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginErr && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs py-2.5 px-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loginErr}</span>
                </div>
              )}

              <button 
                onClick={doLogin} 
                className="w-full bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] border-none font-bold py-3.5 px-4 rounded-xl text-sm transition-all active:scale-[0.98] shadow-md shadow-neutral-200/50 cursor-pointer"
              >
                Masuk
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-[11px] text-neutral-400 font-medium">
            © 2026 Aksoro Business School. All Rights Reserved.
          </div>
        </div>
      </div>
    );
  }

  const navBar = (
    <div className="bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between h-14 sticky top-0 z-30 select-none shadow-sm shadow-neutral-100/55">
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-3 shrink-0">
          <AksoroLogoSmall />
          <div className="w-[1px] h-6 bg-neutral-200" />
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-1.5 shrink-0">
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inConsole ? "bg-[#291a0c] text-[#ffeb00] shadow-sm" : "text-neutral-600 hover:bg-neutral-100"}`}
              onClick={() => { setAdminCtx("console"); setAdminTab("overview"); }}
            >
              Console
            </button>
            <button 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inMonitor ? "bg-[#291a0c] text-[#ffeb00] shadow-sm" : "text-neutral-600 hover:bg-neutral-100"}`}
              onClick={() => { setAdminCtx("monitoring"); setSelDiv("Marketing"); setView("board"); }}
            >
              Monitor
            </button>
            {hasOpRole && (
              <button 
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inOpWS ? "bg-[#291a0c] text-[#ffeb00] shadow-sm" : "text-neutral-600 hover:bg-neutral-100"}`}
                onClick={() => { setAdminCtx("operational"); setView("board"); setOpMode("my_tasks"); }}
              >
                My Ops
              </button>
            )}
          </div>
        )}

        {(isLeader || (inOpWS && effRole === "team_leader") || isAdmin) && (
          <div className="flex items-center gap-1 shrink-0 bg-neutral-100 p-1 rounded-lg">
            <button 
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${opMode === "my_tasks" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
              onClick={() => { setOpMode("my_tasks"); setView("board"); }}
            >
              My Tasks
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${opMode === "team_board" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
              onClick={() => { setOpMode("team_board"); setView("board"); }}
            >
              Team Board
            </button>
          </div>
        )}

        {isMember && (
          <div className="flex items-center gap-1 shrink-0 bg-neutral-100 p-1 rounded-lg">
            <button 
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${opMode === "my_tasks" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
              onClick={() => { setOpMode("my_tasks"); setView("board"); }}
            >
              My Tasks
            </button>
            <button 
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${opMode === "team_board" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"}`}
              onClick={() => { setOpMode("team_board"); setView("board"); }}
            >
              Team Board
            </button>
          </div>
        )}

        <div className="w-[1px] h-6 bg-neutral-200 shrink-0" />

        <div className="flex items-center gap-1 shrink-0">
          <button 
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${view === "board" ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"}`}
            onClick={() => setView("board")}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Kanban</span>
          </button>
          
          {showDash && (
            <button 
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${view === "dashboard" ? "bg-neutral-100 text-[#291a0c]" : "text-neutral-500 hover:bg-neutral-50"}`}
              onClick={() => setView("dashboard")}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Analytics</span>
            </button>
          )}

          <button 
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${view === "history" ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50"}`}
            onClick={() => setView("history")}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">History</span>
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {syncStatus === "live" && (
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-emerald-700 font-bold hidden md:inline">Real-time Cloud Aktif</span>
          </div>
        )}
        {syncStatus === "connecting" && (
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            <span className="text-[10px] text-amber-700 font-bold hidden md:inline">Menghubungkan...</span>
          </div>
        )}
        {syncStatus === "offline" && (
          <div className="flex items-center gap-1.5 bg-neutral-100 border border-neutral-300 px-2.5 py-1 rounded-lg">
            <CloudLightning className="w-3 h-3 text-neutral-400" />
            <span className="text-[10px] text-neutral-500 font-bold hidden md:inline">Lokal (Luring)</span>
          </div>
        )}

        <div className="hidden sm:flex items-center gap-2 bg-neutral-50 border border-neutral-200/60 rounded-xl p-1.5 pr-3">
          <div className="w-7 h-7 rounded-full bg-[#291a0c] text-[#ffeb00] text-[10px] font-black flex items-center justify-center shadow-sm">
            {user.avatar}
          </div>
          <div className="text-left leading-tight">
            <div className="text-[12px] font-bold text-neutral-800">{user.name}</div>
            <div className="text-[9px] text-neutral-400 uppercase font-black tracking-wider">
              {user.role.replace(/_/g, " ")} {user.division ? `· ${user.division}` : ""}
            </div>
          </div>
        </div>
        <button 
          onClick={() => { setUser(null); showToast("Berhasil Logout"); }} 
          className="p-2 border border-neutral-200 hover:border-red-200 text-neutral-400 hover:text-red-500 rounded-xl bg-white hover:bg-red-50/20 transition-all cursor-pointer"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const contextBanner = (() => {
    let style = "bg-[#291a0c] text-[#ffeb00] border-b border-[#3d2916]";
    let icon = "⚙️";
    let label = "Admin Console";
    let desc = "User & Division Management System";

    if (inConsole) {
      return (
        <div className="bg-[#3d2916] text-[#ffeb00] px-4 md:px-6 py-2.5 text-xs flex items-center justify-between border-b border-amber-900/35">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-5 h-5 bg-[#ffeb00] text-[#291a0c] rounded font-bold text-xs">🛠️</span>
            <div>
              <span className="font-bold text-white">Aksoro Administrator Portal</span>
              <span className="text-amber-200/50 mx-2">|</span>
              <span className="text-amber-100/90 font-medium">Control panel internal & penugasan</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[11px] text-amber-200/60">
            <Shield className="w-3.5 h-3.5 text-[#ffeb00]" /> Secure Root Access Active
          </div>
        </div>
      );
    }
    
    if (inMonitor) {
      style = "bg-amber-950 text-amber-100 border-amber-900/40";
      icon = "👁️";
      label = "Super Monitoring Workspace";
      desc = `Viewing all details in: ${selDiv} (Read-Only)`;
    } else if (inOpWS) {
      style = "bg-orange-950 text-orange-100 border-orange-900/40";
      icon = "🏢";
      label = "System Administrator Operational View";
      desc = `${user?.opRole?.replace(/_/g, " ")} · ${user?.opDivision} Workspace`;
    } else if (isLeader) {
      style = "bg-[#3e2712] text-amber-100 border-amber-900/30";
      icon = "👑";
      label = `Team Leader Dashboard`;
      desc = `${user?.division} division · ${opMode === "my_tasks" ? "Personal Board" : "Team Performance View"}`;
    } else if (isMember) {
      style = "bg-[#3d2916] text-amber-100 border-amber-900/20";
      icon = "👤";
      label = `Team Member Operational Portal`;
      desc = `${user?.division} division · ${opMode === "my_tasks" ? "My Personal Assignments" : "Interactive Team Board (Read-only)"}`;
    } else if (isAdmin) {
      style = "bg-neutral-900 text-amber-100 border-neutral-950";
      icon = "🛡️";
      label = `Super Admin Division View`;
      desc = `${user?.division || "All"} Division · ${opMode === "my_tasks" ? "Personal Board" : "Interactive Team Board"}`;
    }

    return (
      <div className={`px-4 md:px-6 py-2.5 text-xs flex items-center gap-2 border-b ${style} select-none`}>
        <span className="text-sm">{icon}</span>
        <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-2">
          <strong className="font-bold tracking-tight">{label}</strong>
          <span className="opacity-40 hidden sm:inline">|</span>
          <span className="opacity-80 truncate">{desc}</span>
        </div>
      </div>
    );
  })();

  const dateStrip = (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100/30 border-b border-amber-200/50 px-4 md:px-6 py-1.5 flex items-center justify-between text-[11px] text-amber-900/85 font-semibold">
      <div className="flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-amber-600" />
        <span>Hari ini: {todayLabel()}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-500 " />
        <span className="text-[10px] text-neutral-500">Live Auto-Save Activated</span>
      </div>
    </div>
  );

  if (inConsole) {
    const activeCount = users.filter(u => u.active).length;
    return (
      <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased">
        {navBar}
        {contextBanner}
        {dateStrip}
        
        <div className="max-w-[1200px] mx-auto p-4 md:p-6 animate-in fade-in duration-300">
          <div className="flex gap-2 border-b border-neutral-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Division Overview", icon: LayoutGrid },
              { id: "users", label: "User Management", icon: Users },
              { id: "divisions", label: "Division Structures", icon: Building2 }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${adminTab === tab.id ? "bg-[#291a0c] text-[#ffeb00] shadow-sm animate-pulse-once" : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200/60"}`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {toast && (
            <div className="fixed bottom-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 bg-[#291a0c] border-neutral-950 text-white animate-bounce">
              <Check className="w-4 h-4 text-[#ffeb00]" />
              <span>{toast.message}</span>
            </div>
          )}

          {adminTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
                {[
                  { label: "Total Users", val: users.length, icon: Users, col: "text-amber-500 bg-amber-50" },
                  { label: "Active Team", val: activeCount, icon: Activity, col: "text-emerald-500 bg-emerald-50" },
                  { label: "Inactive Accounts", val: users.length - activeCount, icon: Shield, col: "text-rose-500 bg-rose-50" },
                  { label: "Total Divisions", val: DIVS.length, icon: Building2, col: "text-blue-500 bg-blue-50" },
                  { label: "Baseline Tasks", val: tasks.length, icon: CheckSquare, col: "text-purple-500 bg-purple-50" }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="bg-white border border-neutral-200/75 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:translate-y-[-2px] transition-all">
                      <div className="space-y-1">
                        <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">{stat.label}</span>
                        <div className="text-2xl font-black tracking-tight">{stat.val}</div>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.col} shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DIVS.map(d => {
                  const ldrs = leadersOf(d);
                  const mems = membersOf(d);
                  const dt = tasks.filter(t => t.division === d);
                  const done = dt.filter(t => t.status === "Done").length;
                  const comp = dt.length > 0 ? Math.round((done / dt.length) * 100) : 0;
                  
                  return (
                    <div key={d} className="bg-white border border-neutral-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-[3px] bg-neutral-200 group-hover:bg-[#ffeb00] transition-colors" />
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-black text-neutral-900 text-base tracking-tight">{d}</h3>
                          <p className="text-xs text-neutral-400 mt-0.5">{ldrs.length} Leaders/Admins · {mems.length} Members</p>
                        </div>
                        <span className="text-xs font-bold bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-full px-2.5 py-1">
                          {comp}% Complete
                        </span>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span>Progress Status</span>
                          <span className="font-bold">{dt.length} Active Tasks</span>
                        </div>
                        {progressLine(comp)}
                        
                        <div className="pt-2 flex items-center justify-between text-[11px] border-t border-neutral-100">
                          <span className="text-neutral-400 font-semibold">{done} of {dt.length} Complete</span>
                          <button 
                            onClick={() => { setAdminCtx("monitoring"); setSelDiv(d); setView("board"); }} 
                            className="inline-flex items-center gap-1 text-xs font-bold text-neutral-800 hover:text-black hover:underline cursor-pointer"
                          >
                            Launch Monitor <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {adminTab === "users" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black tracking-tight text-neutral-900">Registered Users Directory</h2>
                  <p className="text-xs text-neutral-500 mt-0.5">Control access credentials and operational division assignments</p>
                </div>
                <button 
                  onClick={() => setAddUModal(true)}
                  className="bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#ffeb00]" /> Add New User
                </button>
              </div>

              <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-xs">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200">
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">User details</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">Username</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">Baseline Password</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">System Role</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">Assigned Division</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {users.map(u => (
                        <tr key={u.id} className={`hover:bg-neutral-50/50 transition-colors ${!u.active ? "bg-neutral-50/40 text-neutral-400" : ""}`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center shrink-0 shadow-sm border ${u.active ? "bg-[#ffeb00] text-black border-neutral-300" : "bg-neutral-200 text-neutral-400 border-neutral-300"}`}>
                                {u.avatar}
                              </span>
                              <div>
                                <span className="font-bold text-neutral-900 block">{u.name}</span>
                                {u.role === "super_admin" && u.opRole && (
                                  <span className="text-[10px] text-amber-600 font-semibold uppercase">{u.opRole.replace(/_/g, " ")} Mode</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-medium text-neutral-500">@{u.username}</td>
                          <td className="py-3 px-4">
                            <code className="bg-amber-50 hover:bg-amber-100/50 border border-amber-200 text-amber-800 font-mono font-bold px-2 py-1 rounded text-[11px] tracking-wide select-all transition-colors cursor-copy" title="Click to select password">
                              {u.password}
                            </code>
                          </td>
                          <td className="py-3 px-4">{roleChip(u.role)}</td>
                          <td className="py-3 px-4 font-semibold text-neutral-700">{u.division || <span className="text-neutral-300">—</span>}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.active ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-neutral-100 text-neutral-400 border-neutral-200"}`}>
                              {u.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => setEditUModal({ ...u })}
                                className="px-2.5 py-1.5 border border-neutral-200 hover:border-black rounded-lg text-[11px] font-bold text-neutral-700 hover:text-black transition-colors cursor-pointer bg-white"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => toggleUserActiveState(u)}
                                className={`px-2.5 py-1.5 border rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${u.active ? "border-amber-200 text-amber-600 hover:bg-amber-50" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}`}
                              >
                                {u.active ? "Deactivate" : "Activate"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminTab === "divisions" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DIVS.map(d => {
                const ldrs = leadersOf(d);
                const mems = membersOf(d);
                return (
                  <div key={d} className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <h3 className="font-black text-neutral-900 tracking-tight">{d} Division</h3>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold tracking-widest mt-0.5">Structural Unit</p>
                      </div>
                      <span className="bg-neutral-100 text-neutral-700 px-2.5 py-1 rounded-full text-xs font-bold border border-neutral-200/60">
                        {ldrs.length + mems.length} Staff
                      </span>
                    </div>

                    <div>
                      <div className="text-[9px] font-black tracking-wider text-blue-500 uppercase mb-2">Team Leaders & Admins ({ldrs.length})</div>
                      {ldrs.length === 0 ? (
                        <div className="text-xs text-neutral-300 italic py-1">No leaders assigned</div>
                      ) : (
                        ldrs.map(u => (
                          <div key={u.id} className="flex items-center gap-2 bg-blue-50/40 border border-blue-100/50 p-2 rounded-xl mb-1.5">
                            <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black flex items-center justify-center shrink-0">{u.avatar}</span>
                            <div className="min-w-0">
                              <span className="font-bold text-neutral-800 text-xs block truncate">{u.name}</span>
                              <span className="text-[10px] text-neutral-400">@{u.username} · <strong className="text-[9px] text-blue-700 uppercase">{u.role.replace(/_/g, " ")}</strong></span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div>
                      <div className="text-[9px] font-black tracking-wider text-purple-500 uppercase mb-2">Staff Members ({mems.length})</div>
                      {mems.length === 0 ? (
                        <div className="text-xs text-neutral-300 italic py-1">No staff members</div>
                      ) : (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {mems.map(u => (
                            <div key={u.id} className="flex items-center justify-between gap-3 p-2 bg-neutral-50 rounded-xl hover:bg-neutral-100/50 transition-colors">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6.5 h-6.5 rounded-full bg-neutral-200 text-neutral-700 text-[9px] font-bold flex items-center justify-center shrink-0">{u.avatar}</span>
                                <span className="text-xs font-semibold text-neutral-800 truncate">{u.name}</span>
                              </div>
                              <span className="text-[10px] text-neutral-400">@{u.username}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* User Modals within admin Tab */}
        {editUModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditUModal(null)}>
            <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 bg-[#291a0c] text-[#ffeb00] flex items-center justify-between border-b border-[#291a0c]">
                <h3 className="font-black text-sm uppercase tracking-wide">Edit System User Info</h3>
                <button onClick={() => setEditUModal(null)} className="text-amber-200 hover:text-white transition-colors cursor-pointer text-sm">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none transition-all" value={editUModal.name} onChange={e => setEditUModal({ ...editUModal, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Username</label>
                  <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none transition-all" value={editUModal.username} onChange={e => setEditUModal({ ...editUModal, username: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Password</label>
                  <div className="flex gap-2">
                    <input className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none transition-all" value={editUModal.password} onChange={e => setEditUModal({ ...editUModal, password: e.target.value })} />
                    <button onClick={() => setEditUModal({ ...editUModal, password: genPw() })} className="bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] text-xs font-bold px-3 py-2.5 rounded-xl cursor-pointer">Generate</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Role</label>
                    <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={editUModal.role} onChange={e => setEditUModal({ ...editUModal, role: e.target.value })}>
                      <option value="super_admin">Super Admin</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Division</label>
                    <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={editUModal.division || ""} onChange={e => setEditUModal({ ...editUModal, division: e.target.value || null })}>
                      <option value="">— None —</option>
                      {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-3 flex gap-2">
                  <button onClick={() => doSaveUser(editUModal)} className="flex-1 bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer">Simpan Perubahan</button>
                  <button onClick={() => setEditUModal(null)} className="px-5 py-3 border border-neutral-200 text-neutral-500 hover:text-[#291a0c] rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer">Batal</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {addUModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setAddUModal(false)}>
            <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="px-5 py-4 bg-[#291a0c] text-[#ffeb00] flex items-center justify-between border-b border-[#291a0c]">
                <h3 className="font-black text-sm uppercase tracking-wide">Register New Account</h3>
                <button onClick={() => setAddUModal(false)} className="text-amber-200 hover:text-white transition-colors cursor-pointer text-sm">✕</button>
              </div>
              <div className="p-5 space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800">
                  Password user baru akan dihasilkan secara otomatis demi keamanan data.
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nu.name} onChange={e => setNu({ ...nu, name: e.target.value })} placeholder="contoh: Budi Hartono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Username *</label>
                  <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nu.username} onChange={e => setNu({ ...nu, username: e.target.value })} placeholder="contoh: budi" />
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Role</label>
                    <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nu.role} onChange={e => setNu({ ...nu, role: e.target.value })}>
                      <option value="super_admin">Super Admin</option>
                      <option value="team_leader">Team Leader</option>
                      <option value="team_member">Team Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Division</label>
                    <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nu.division || ""} onChange={e => setNu({ ...nu, division: e.target.value || null })}>
                      <option value="">— None —</option>
                      {DIVS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
                <div className="pt-3 flex gap-2">
                  <button onClick={() => { if (nu.name && nu.username) doSaveUser(nu); }} className="flex-1 bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer">Create Account</button>
                  <button onClick={() => setAddUModal(false)} className="px-5 py-3 border border-neutral-200 text-neutral-500 hover:text-[#291a0c] rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer">Batal</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const subbar = (
    <div className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none">
      <div className="flex flex-wrap items-center gap-2">
        {inMonitor ? (
          DIVS.map(d => (
            <button 
              key={d} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${selDiv === d ? "bg-[#ffeb00] border-2 text-neutral-800 font-black" : "bg-white hover:bg-neutral-50 text-neutral-600 border border-neutral-200"}`}
              style={{ borderColor: BK }}
              onClick={() => setSelDiv(d)}
            >
              {d}
            </button>
          ))
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#ffeb00]/10 border border-amber-300 text-amber-950 rounded-xl text-xs font-black uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5 text-amber-700" />
            {activeDiv} Workspace
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex items-center flex-1 sm:flex-initial">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 pointer-events-none" />
          <input 
            type="text"
            placeholder="Cari task..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 bg-neutral-50 border border-neutral-200 focus:border-[#ffeb00] focus:ring-1 focus:ring-[#ffeb00] text-xs rounded-xl outline-none w-full sm:w-[180px] transition-all font-semibold"
          />
        </div>

        <div className="relative">
          <select 
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            className="pl-3 pr-8 py-1.5 bg-neutral-50 border border-neutral-200 text-xs rounded-xl outline-none font-bold text-neutral-700 appearance-none cursor-pointer"
          >
            <option value="All">All Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
          <ChevronDown className="w-3 h-3 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {canAdd && (
          <button 
            onClick={() => setAddModal(true)}
            className="bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#ffeb00]" /> New Task
          </button>
        )}
        {(inMonitor || isMemberTeamBoard) && (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-400 rounded-xl text-xs font-bold">
            <Lock className="w-3 h-3 text-neutral-400" /> Read-Only Mode
          </span>
        )}
      </div>
    </div>
  );

  const progressStrip = (() => {
    if (inMonitor || view === "dashboard" || view === "history") return null;
    if (isMemberTeamBoard || isTeamView) {
      const people = [...membersOf(activeDiv), ...leadersOf(activeDiv)];
      return (
        <div className="bg-gradient-to-b from-neutral-50 to-neutral-100/30 border-b border-neutral-200/50 px-4 md:px-6 py-4 space-y-3 select-none animate-in fade-in">
          <div className="text-[10px] font-black tracking-widest text-neutral-400 uppercase">Division Member Velocity Index</div>
          <div className="grid grid-cols-1 gap-3">
            {people.map(m => {
              const mt = tasks.filter(t => t.assignee === m.id && t.division === activeDiv);
              return (
                <div key={m.id} className="w-full">
                  {dailyProgressBar(calcDaily(mt), m.name, m.avatar, "Day Score")}
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-gradient-to-b from-neutral-50 to-neutral-100/30 border-b border-neutral-200/50 px-4 md:px-6 py-4 select-none">
        <div className="w-full">
          {dailyProgressBar(calcDaily(myTasks), user.name, user.avatar)}
        </div>
      </div>
    );
  })();

  const makeCard = (task, readOnly) => {
    const au = users.find(x => x.id === task.assignee);
    const ov = task.status === "Pending";
    const menuOpen = menuOpenId === task.id;
    const canEdit = !inMonitor && !readOnly;
    const isOwn = isMemberTeamBoard && task.assignee === user.id;

    return (
      <div 
        key={task.id}
        draggable={!readOnly && !inMonitor}
        onDragStart={() => !readOnly && !inMonitor && setDragTask(task)}
        className={`bg-white border hover:border-neutral-400 rounded-2xl p-4 mb-3 cursor-grab hover:shadow-md transition-all group relative overflow-hidden select-none ${isOwn ? "ring-2 ring-[#ffeb00]/50" : ""} ${ov ? "border-amber-300 bg-amber-50/20" : "border-neutral-200"}`}
      >
        {canEdit && (
          <div className="absolute top-3 right-3 z-10">
            <button 
              onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpen ? null : task.id); }}
              className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-all cursor-pointer"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {menuOpen && (
              <div 
                onClick={e => e.stopPropagation()} 
                className="absolute right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 min-w-[120px] overflow-hidden"
              >
                <button 
                  onClick={() => { setEditTaskModal({ ...task }); setMenuOpenId(null); }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-neutral-700 hover:bg-neutral-50 hover:text-black flex items-center gap-1.5 border-b border-neutral-100 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-neutral-400" /> Edit Task
                </button>
                <button 
                  onClick={() => setDeleteTaskConfirmId(task.id)}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Delete Task
                </button>
              </div>
            )}
          </div>
        )}

        <div onClick={() => setTaskModalId(task.id)} className="cursor-pointer space-y-3">
          <div className="pr-6">
            <h4 className="font-bold text-neutral-800 text-sm leading-snug group-hover:text-neutral-950 transition-colors">{task.title}</h4>
          </div>

          <div className="flex flex-wrap gap-1">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PCOL[task.priority].bg}`}>
              {task.priority} Priority
            </span>
            {ov && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5 text-amber-500" /> Overdue
              </span>
            )}
            {isOwn && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#ffeb00]/20 text-neutral-900 border-amber-300">
                Assigned to me
              </span>
            )}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between gap-3 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              {task.due ? task.due.slice(5) : "No due date"}
            </span>

            {au && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 ${isOwn ? "bg-[#ffeb00] text-black" : "bg-neutral-100 text-neutral-600 border border-neutral-200"}`}>
                  {au.avatar}
                </span>
                {isMemberTeamBoard && (
                  <span className="truncate font-semibold text-neutral-500 text-[10px]">{au.name.split(" ")[0]}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const boardView = (
    <div className="overflow-x-auto no-scrollbar p-4 md:p-6 select-none animate-in fade-in duration-300">
      <div className="flex gap-4 min-w-[1050px]">
        {COLS.map(col => {
          const colTasks = boardTasks.filter(t => t.status === col);
          const isAct = dragOver === col;
          const readOnly = inMonitor || isMemberTeamBoard;

          return (
            <div 
              key={col}
              onDragOver={e => { if (!readOnly) { e.preventDefault(); setDragOver(col); } }}
              onDrop={() => !readOnly && onDrop(col)}
              onDragLeave={() => setDragOver(null)}
              className={`flex-1 flex flex-col rounded-2xl border min-h-[450px] transition-all duration-300 ${isAct ? "bg-neutral-100 border-dashed border-[#ffeb00]" : "bg-[#f8f7f2] border-neutral-200/60"}`}
            >
              <div className="px-4 py-3 flex items-center justify-between border-b border-neutral-200/80">
                <span className="text-xs font-black text-neutral-700 uppercase tracking-wider">{col}</span>
                <span className="bg-neutral-200 text-neutral-600 font-bold rounded-full px-2 py-0.5 text-[10px]">
                  {colTasks.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto max-h-[600px] no-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-neutral-200/60 rounded-xl text-neutral-300 text-xs text-center p-4">
                    Tarik task ke area ini
                  </div>
                ) : (
                  colTasks.map(t => makeCard(t, readOnly))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const dashView = showDash ? (() => {
    const divDone = divTasks.filter(t => t.status === "Done").length;
    const divComp = divTasks.length > 0 ? Math.round((divDone / divTasks.length) * 100) : 0;
    
    const mStats = [...membersOf(activeDiv), ...leadersOf(activeDiv).filter(u => u.id !== user.id)].map(m => {
      const mt = divTasks.filter(t => t.assignee === m.id);
      return {
        m,
        done: mt.filter(t => t.status === "Done").length,
        pend: mt.filter(t => t.status === "Pending").length,
        prob: mt.filter(t => t.status === "Problem").length,
        dp: calcDaily(mt)
      };
    });

    const lt = divTasks.filter(t => t.assignee === user.id);
    const ld = lt.filter(t => t.status === "Done").length;

    return (
      <div className="max-w-[1000px] mx-auto p-4 md:p-6 space-y-6 animate-in fade-in duration-350">
        {(isLeader || (inOpWS && effRole === "team_leader") || isAdmin) && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-[#291a0c] text-[#ffeb00] flex items-center justify-center rounded font-bold text-xs">📈</span>
              <h3 className="text-sm font-black text-neutral-800 uppercase tracking-wide">My Performance Snapshot</h3>
            </div>
            
            {dailyProgressBar(calcDaily(lt), user.name, user.avatar, "My Score")}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              {[
                { label: "My Total Tasks", val: lt.length, color: "text-neutral-900 bg-neutral-50" },
                { label: "Done Tasks", val: ld, color: "text-emerald-600 bg-emerald-50" },
                { label: "Ongoing Tasks", val: lt.filter(t => t.status === "Ongoing").length, color: "text-blue-600 bg-blue-50" },
                { label: "Pending Tasks", val: lt.filter(t => t.status === "Pending").length, color: "text-amber-600 bg-amber-50" }
              ].map((s, i) => (
                <div key={i} className={`p-3 rounded-xl border border-neutral-100 ${s.color}`}>
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">{s.label}</span>
                  <span className="text-xl font-black mt-1 block">{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {[
            { label: "Division Success Rate", val: `${divComp}%`, color: "text-emerald-500 bg-emerald-50" },
            { label: "Division Total Tasks", val: divTasks.length, color: "text-neutral-900 bg-neutral-50" },
            { label: "Task Rollovers (Pending)", val: divTasks.filter(t => t.status === "Pending").length, color: "text-amber-500 bg-amber-50" },
            { label: "Division Blockers (Problem)", val: divTasks.filter(t => t.status === "Problem").length, color: "text-rose-500 bg-rose-50" }
          ].map((s, i) => (
            <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-black uppercase tracking-wider block">{s.label}</span>
                <span className="text-xl font-black tracking-tight block">{s.val}</span>
              </div>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${s.color}`}>✓</span>
            </div>
          ))}
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">👥</span>
            <div>
              <h3 className="font-black text-neutral-900 text-sm uppercase tracking-tight">Team Performance Index</h3>
              <p className="text-[11px] text-neutral-400">Comparing member daily target compliance scores</p>
            </div>
          </div>
          
          <div className="space-y-4 divide-y divide-neutral-100">
            {mStats.sort((a, b) => b.dp - a.dp).map(({ m, done, pend, prob, dp }) => (
              <div key={m.id} className="pt-4 first:pt-0">
                {dailyProgressBar(dp, m.name, m.avatar, "Target Score")}
                <div className="flex flex-wrap gap-1.5 mt-2.5 pl-12">
                  <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold">
                    {done} tasks done
                  </span>
                  {pend > 0 && (
                    <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      {pend} pending rollover
                    </span>
                  )}
                  {prob > 0 && (
                    <span className="bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-bold">
                      {prob} blocker issues
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  })() : null;

  const historyView = (() => {
    const ranges = [
      { k: "day", l: "Hari Ini" },
      { k: "week", l: "1 Minggu" },
      { k: "month", l: "1 Bulan" },
      { k: "year", l: "1 Tahun" },
      { k: "custom", l: "Custom Periode" }
    ];
    const ht = histList;

    return (
      <div className="max-w-[850px] mx-auto p-4 md:p-6 space-y-5 select-none animate-in fade-in duration-300">
        <div>
          <h2 className="text-lg font-black text-neutral-900 tracking-tight">
            {isMemberTeamBoard ? `Timeline Selesai — ${activeDiv}` : "Log Penyelesaian Task"}
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">Daftar historis seluruh task yang berhasil diselesaikan</p>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-neutral-200 pb-3">
          {ranges.map(r => (
            <button 
              key={r.k} 
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${histRange === r.k ? "bg-[#291a0c] text-[#ffeb00]" : "bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-600"}`}
              onClick={() => setHistRange(r.k)}
            >
              {r.l}
            </button>
          ))}
        </div>

        {histRange === "custom" && (
          <div className="flex flex-wrap gap-3 items-end bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm animate-in fade-in duration-200">
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Dari Tanggal</label>
              <input type="date" className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs outline-none" value={histFrom} onChange={e => setHistFrom(e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Sampai Tanggal</label>
              <input type="date" className="bg-neutral-50 border border-neutral-200 rounded-xl py-2 px-3 text-xs outline-none" value={histTo} onChange={e => setHistTo(e.target.value)} />
            </div>
          </div>
        )}

        {ht.length === 0 ? (
          <div className="bg-white border border-neutral-200/80 rounded-2xl p-10 text-center text-neutral-300 text-xs">
            Tidak ada arsip task selesai dalam rentang waktu terpilih.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Arsip ({ht.length} task)</div>
            {ht.map(t => {
              const au = users.find(x => x.id === t.assignee);
              const doneLog = [...t.logs].reverse().find(l => l.action.toLowerCase().includes("done"));
              const isOwn = t.assignee === user.id;

              return (
                <div 
                  key={t.id} 
                  onClick={() => setTaskModalId(t.id)}
                  className={`bg-white border hover:border-neutral-400 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all ${isOwn && isMemberTeamBoard ? "ring-1 ring-[#ffeb00]/40" : "border-neutral-200"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-500 flex items-center justify-center text-sm shrink-0 font-bold">✓</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-neutral-900 text-xs sm:text-sm truncate leading-snug">{t.title}</h4>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-neutral-400 mt-1">
                        <span className="font-black text-neutral-500 uppercase">{t.division}</span>
                        <span>•</span>
                        {au && isMemberTeamBoard && (
                          <span className={isOwn ? "text-amber-600 font-bold" : "text-neutral-500"}>
                            👤 {au.name} {isOwn ? "(Saya)" : ""}
                          </span>
                        )}
                        {doneLog && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 font-semibold">Tuntas {doneLog.ts}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${PCOL[t.priority].bg} hidden sm:inline`}>
                      {t.priority}
                    </span>
                    <span className="text-xs">{gE(t.progress)}</span>
                    {au && (
                      <span className={`w-6 h-6 rounded-full text-[9px] font-black flex items-center justify-center shrink-0 border ${isOwn && isMemberTeamBoard ? "bg-[#ffeb00] text-black" : "bg-neutral-100 text-neutral-500 border-neutral-200"}`}>
                        {au.avatar}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  })();

  const taskModalEl = (() => {
    if (!taskModalId) return null;
    const task = tasks.find(t => t.id === taskModalId);
    if (!task) return null;
    
    const au = users.find(x => x.id === task.assignee);
    const cu = users.find(x => x.id === task.created_by);
    const readOnly = inMonitor || isMemberTeamBoard;
    const moves = !readOnly ? COLS.filter(col => col !== task.status && canMove(effRole, task.status, col)) : [];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setTaskModalId(null)}>
        <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-5 py-4 bg-[#291a0c] text-[#ffeb00] flex items-start justify-between border-b border-[#291a0c]">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">Task Specifications</h3>
              <p className="text-[10px] text-amber-200/60 mt-0.5">UID: {task.id}</p>
            </div>
            <button onClick={() => setTaskModalId(null)} className="text-amber-200 hover:text-white transition-colors cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
            <div>
              <h4 className="font-bold text-neutral-950 text-base leading-snug">{task.title}</h4>
              <div className="flex flex-wrap gap-1 mt-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${PCOL[task.priority].bg}`}>
                  {task.priority} Priority
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-neutral-100 text-neutral-700 border-neutral-200">
                  Status: {task.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "PIC / Assigned To", val: au?.name },
                { label: "Assigned By", val: cu?.name },
                { label: "Deadline Due", val: task.due || "No date set" },
                { label: "Structural Unit", val: task.division }
              ].map((item, i) => (
                <div key={i} className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-2.5">
                  <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider block">{item.label}</span>
                  <span className="text-xs font-bold text-neutral-800 mt-1 block truncate">{item.val || "—"}</span>
                </div>
              ))}
            </div>

            {readOnly && (
              <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 shrink-0" /> Monitor Mode active. Status changes are read-only.
              </div>
            )}

            {task.notes && (
              <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block mb-1">Contextual Notes</span>
                <p className="text-xs text-neutral-700 leading-relaxed">{task.notes}</p>
              </div>
            )}

            {moves.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Transition Workflow Status</span>
                <div className="flex flex-wrap gap-1.5">
                  {moves.map(col => (
                    <button 
                      key={col} 
                      onClick={() => doMove(task, col)}
                      className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all hover:shadow-sm cursor-pointer ${col === "Done" ? "border-emerald-200 hover:border-emerald-500 text-emerald-600 hover:bg-emerald-50" : col === "Problem" ? "border-rose-200 hover:border-rose-500 text-rose-600 hover:bg-rose-50" : "border-neutral-200 hover:border-black text-neutral-700"}`}
                    >
                      → {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">Activity Log</span>
              <div className="max-h-[140px] overflow-y-auto border border-neutral-100 rounded-xl divide-y divide-neutral-50 bg-neutral-50/30">
                {[...(task.logs || [])].reverse().map((log, i) => (
                  <div key={i} className="p-2.5 text-xs flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <strong className="font-bold text-neutral-800 block truncate">{log.user}</strong>
                      <span className="text-neutral-500 text-[11px] mt-0.5 block">{log.action}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 shrink-0 font-mono">{log.ts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const editTaskModalEl = (() => {
    if (!editTaskModal) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setEditTaskModal(null)}>
        <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-[450px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-5 py-4 bg-[#291a0c] text-[#ffeb00] flex items-center justify-between border-b border-[#291a0c]">
            <h3 className="font-black text-sm uppercase tracking-wide">Modify Task Parameters</h3>
            <button onClick={() => setEditTaskModal(null)} className="text-amber-200 hover:text-white transition-colors cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Judul Task *</label>
              <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={editTaskModal.title} onChange={e => setEditTaskModal({ ...editTaskModal, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Priority</label>
                <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={editTaskModal.priority} onChange={e => setEditTaskModal({ ...editTaskModal, priority: e.target.value })}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Due Date</label>
                <input type="date" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={editTaskModal.due || ""} onChange={e => setEditTaskModal({ ...editTaskModal, due: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Notes / Deskripsi</label>
              <textarea rows={3} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none resize-none" placeholder="Masukkan catatan tambahan..." value={editTaskModal.notes || ""} onChange={e => setEditTaskModal({ ...editTaskModal, notes: e.target.value })} />
            </div>

            <div className="pt-3 flex gap-2">
              <button onClick={doSaveEditTask} className="flex-1 bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer">Simpan Perubahan</button>
              <button onClick={() => setEditTaskModal(null)} className="px-5 py-3 border border-neutral-200 text-neutral-500 hover:text-black rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer">Batal</button>
            </div>
          </div>
        </div>
      </div>
    );
  })();

  const addModalEl = (addModal && canAdd) ? (() => {
    const opDiv = inOpWS ? user?.opDivision : selDiv;
    const dm = users.filter(u => u.division === opDiv && u.role === "team_member" && u.active);

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setAddModal(false)}>
        <div className="bg-white border border-neutral-200 rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="px-5 py-4 bg-[#291a0c] text-[#ffeb00] flex items-center justify-between border-b border-[#291a0c]">
            <div>
              <h3 className="font-black text-sm uppercase tracking-wide">Create Structural Task</h3>
              <p className="text-[10px] text-amber-400 mt-0.5">Creating inside: {opDiv}</p>
            </div>
            <button onClick={() => setAddModal(false)} className="text-amber-200 hover:text-white transition-colors cursor-pointer text-sm">✕</button>
          </div>

          <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar">
            {isLdrCtx && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider">Delegasikan Task?</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button 
                    onClick={() => setNt({ ...nt, assign_to: "self" })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${nt.assign_to === "self" ? "bg-amber-50 border-amber-400 ring-1 ring-amber-400" : "bg-neutral-50 hover:bg-neutral-100/50 border-neutral-200"}`}
                  >
                    <span className="font-bold text-neutral-800 text-xs block">Milik Saya</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">Assign ke pribadi</span>
                  </button>
                  <button 
                    onClick={() => setNt({ ...nt, assign_to: dm[0]?.id || "self" })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${nt.assign_to !== "self" ? "bg-blue-50 border-blue-400 ring-1 ring-blue-400" : "bg-neutral-50 hover:bg-neutral-100/50 border-neutral-200"}`}
                  >
                    <span className="font-bold text-neutral-800 text-xs block">Delegasikan</span>
                    <span className="text-[10px] text-neutral-400 mt-0.5 block">Assign ke anggota</span>
                  </button>
                </div>
              </div>
            )}

            {isLdrCtx && nt.assign_to !== "self" && (
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Pilih Anggota</label>
                <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nt.assign_to} onChange={e => setNt({ ...nt, assign_to: e.target.value })}>
                  {dm.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Judul Task *</label>
              <input className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" placeholder="contoh: Analisis Laporan Keuangan" value={nt.title} onChange={e => setNt({ ...nt, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Priority</label>
                <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nt.priority} onChange={e => setNt({ ...nt, priority: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Due Date</label>
                <input type="date" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-xs text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none" value={nt.due} onChange={e => setNt({ ...nt, due: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Contextual Notes / Deskripsi</label>
              <textarea rows={2} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-2.5 px-3.5 text-sm text-neutral-900 focus:ring-1 focus:ring-amber-400 outline-none resize-none" placeholder="Masukkan instruksi pengerjaan..." value={nt.notes} onChange={e => setNt({ ...nt, notes: e.target.value })} />
            </div>

            <div className="pt-3 flex gap-2">
              <button onClick={doAddTask} className="flex-1 bg-[#291a0c] hover:bg-[#3d2916] text-[#ffeb00] py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer">Buat Task Baru</button>
              <button onClick={() => setAddModal(false)} className="px-5 py-3 border border-neutral-200 text-neutral-500 hover:text-black rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer">Batal</button>
            </div>
          </div>
        </div>
      </div>
    );
  })() : null;

  const customConfirmModalEl = deleteTaskConfirmId ? (() => {
    const taskToDelete = tasks.find(t => t.id === deleteTaskConfirmId);
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-55 flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-2xl border border-neutral-200/80 w-full max-w-[400px] shadow-2xl p-6 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-xl">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-neutral-900 text-sm uppercase tracking-wide">Konfirmasi Hapus</h3>
            <p className="text-xs text-neutral-500 mt-2">
              Apakah Anda benar-benar ingin menghapus tugas <strong className="text-neutral-800">"{taskToDelete?.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={() => {
                doDeleteTask(deleteTaskConfirmId);
                setDeleteTaskConfirmId(null);
                setTaskModalId(null);
              }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Hapus Permanen
            </button>
            <button
              onClick={() => setDeleteTaskConfirmId(null)}
              className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    );
  })() : null;

  return (
    <div className="min-h-screen bg-[#fafaf8] text-neutral-900 font-sans antialiased selection:bg-[#ffeb00] selection:text-black pb-12">
      {navBar}
      {contextBanner}
      {dateStrip}
      {subbar}
      {progressStrip}

      {view === "board" && boardView}
      {view === "dashboard" && showDash && dashView}
      {view === "history" && historyView}

      {taskModalEl}
      {editTaskModalEl}
      {addModalEl}
      {customConfirmModalEl}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 transition-all duration-300 bg-[#291a0c] border-neutral-950 text-white animate-in slide-in-from-bottom-5">
          <Check className="w-4 h-4 text-[#ffeb00] shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
