import React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { PageHeader, Loading } from "./Dashboard";
import { apiFetch, dateText, money } from "../api";

export default function CustomerDetails(){
 const {id}=useParams(); const [c,setC]=useState(null); const [loading,setLoading]=useState(true);
 useEffect(()=>{apiFetch(`/customers/${id}`).then(d=>setC(d.customer)).finally(()=>setLoading(false))},[id]);
 if(loading)return <AppShell><Loading/></AppShell>;
 if(!c)return <AppShell><div className="alert alert-danger">Customer not found.</div></AppShell>;
 const paid=c.payments?.reduce((s,p)=>s+Number(p.amount||0),0)||Number(c.advanceAmount||0), balance=Math.max(Number(c.totalAmount)-paid,0);
 return <AppShell><PageHeader title="Customer Details" subtitle="Booking and payment information." action={<div className="d-flex gap-2"><Link to="/customers" className="btn btn-outline-secondary">Back</Link><Link to={`/receipt/${id}`} className="btn btn-dark"><i className="bi bi-receipt me-2"/>Receipt</Link></div>}/>
 <div className="panel-card mb-4"><div className="d-flex align-items-center gap-3"><div className="avatar xl">{c.customerName.slice(0,1).toUpperCase()}</div><div><h3 className="mb-1">{c.customerName}</h3><div className="text-secondary">{c.phone} · Wedding: {dateText(c.weddingDate)}</div></div></div></div>
 <div className="row g-3 mb-4">{[["Package",money(c.totalAmount),"dark"],["Paid",money(paid),"success"],["Balance",money(balance),"danger"]].map(([a,b,cl])=><div className="col-md-4" key={a}><div className="stat-card compact"><div><small>{a}</small><div className={`stat-value text-${cl}`}>{b}</div></div></div></div>)}</div>
 <div className="row g-4"><div className="col-lg-5"><section className="panel-card h-100"><h5>Services</h5><div className="service-list">{(c.services||[]).map(s=><span key={s} className="badge text-bg-light border p-2">{s}</span>)}</div></section></div><div className="col-lg-7"><section className="panel-card"><h5>Payment History</h5>{c.payments?.length?<div className="table-responsive"><table className="table align-middle"><thead><tr><th>Date</th><th>Method</th><th className="text-end">Amount</th></tr></thead><tbody>{c.payments.map((p,i)=><tr key={p._id||i}><td>{dateText(p.date)}</td><td>{p.method}</td><td className="text-end fw-semibold">{money(p.amount)}</td></tr>)}</tbody></table></div>:<div className="empty-box">No payments recorded.</div>}</section></div></div>
 </AppShell>
}
