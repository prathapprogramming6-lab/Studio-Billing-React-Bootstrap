import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, dateText, money } from "../api";
import AppShell from "../components/AppShell";

export default function Dashboard(){
 const [customers,setCustomers]=useState([]);
 const [loading,setLoading]=useState(true);
 useEffect(()=>{apiFetch("/customers").then(d=>setCustomers(d.customers||[])).finally(()=>setLoading(false));},[]);
 const stats=useMemo(()=>{
   const total=customers.reduce((s,c)=>s+Number(c.totalAmount||0),0);
   const paid=customers.reduce((s,c)=>s+(c.payments?.length?c.payments.reduce((a,p)=>a+Number(p.amount||0),0):Number(c.advanceAmount||0)),0);
   return {count:customers.length,total,paid,balance:Math.max(total-paid,0)};
 },[customers]);
 const upcoming=[...customers].filter(c=>c.weddingDate).sort((a,b)=>new Date(a.weddingDate)-new Date(b.weddingDate)).slice(0,5);
 return <AppShell>
   <PageHeader title="Dashboard" subtitle="A quick view of your studio business." />
   <div className="row g-3 mb-4">
    <Stat icon="people-fill" label="Customers" value={stats.count} />
    <Stat icon="cash-stack" label="Package Value" value={money(stats.total)} />
    <Stat icon="wallet2" label="Total Paid" value={money(stats.paid)} />
    <Stat icon="hourglass-split" label="Outstanding" value={money(stats.balance)} />
   </div>
   <div className="row g-4">
    <div className="col-lg-7"><section className="panel-card h-100"><SectionTitle icon="clock-history" title="Recent Customers" action={<Link to="/customers" className="btn btn-sm btn-outline-dark">View all</Link>} />
      {loading?<Loading/>:customers.slice(0,6).map(c=><div className="list-row" key={c._id}><div className="avatar soft">{c.customerName?.slice(0,1).toUpperCase()}</div><div className="flex-grow-1"><div className="fw-semibold">{c.customerName}</div><small className="text-secondary">{c.phone} · {c.weddingDate||"No date"}</small></div><div className="text-end"><strong>{money(c.totalAmount)}</strong><small className="d-block text-secondary">Package</small></div></div>)}
      {!loading&&!customers.length&&<Empty text="No customers yet. Add your first booking."/>}
    </section></div>
    <div className="col-lg-5"><section className="panel-card h-100"><SectionTitle icon="calendar-event" title="Upcoming Events" />
      {upcoming.length?upcoming.map(c=><div className="event-row" key={c._id}><div className="date-pill"><strong>{new Date(c.weddingDate).getDate()}</strong><small>{new Date(c.weddingDate).toLocaleDateString("en-IN",{month:"short"})}</small></div><div><div className="fw-semibold">{c.customerName}</div><small className="text-secondary">{money(c.balanceAmount)} balance</small></div></div>):<Empty text="No upcoming wedding dates."/>}
    </section></div>
   </div>
 </AppShell>
}
export function PageHeader({title,subtitle,action}){return <div className="page-header"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
export function SectionTitle({icon,title,action}){return <div className="section-title"><h5><i className={`bi bi-${icon} me-2`}/>{title}</h5>{action}</div>}
function Stat({icon,label,value}){return <div className="col-md-6 col-xl-3"><div className="stat-card"><div className="stat-icon"><i className={`bi bi-${icon}`}/></div><div><small>{label}</small><div className="stat-value">{value}</div></div></div></div>}
export function Loading(){return <div className="py-5 text-center text-secondary"><div className="spinner-border spinner-border-sm me-2"/>Loading...</div>}
export function Empty({text}){return <div className="empty-box"><i className="bi bi-inbox"/><div>{text}</div></div>}
