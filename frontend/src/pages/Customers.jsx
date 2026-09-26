import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { PageHeader, Loading, Empty } from "./Dashboard";
import { apiFetch, money, dateText } from "../api";

const servicesList=["Traditional Photo","Traditional Video","Candid Photo","Candid Video","Passport Photo","Album","Drone","Pre-wedding"];

export default function Customers(){
 const [customers,setCustomers]=useState([]), [loading,setLoading]=useState(true), [search,setSearch]=useState(""), [editing,setEditing]=useState(null), [showForm,setShowForm]=useState(false), [selected,setSelected]=useState(null);
 const load=()=>apiFetch("/customers").then(d=>setCustomers(d.customers||[])).finally(()=>setLoading(false));
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>customers.filter(c=>(`${c.customerName} ${c.phone}`).toLowerCase().includes(search.toLowerCase())),[customers,search]);
 function openNew(){setEditing(null);setShowForm(true);}
 function edit(c){setEditing(c);setShowForm(true);window.scrollTo({top:0,behavior:"smooth"});}
 async function remove(c){if(!confirm(`Delete ${c.customerName}?`))return;await apiFetch(`/customers/${c._id}`,{method:"DELETE"});load();}
 return <AppShell>
  <PageHeader title="Customers" subtitle="Manage bookings, packages and payment history." action={<button className="btn btn-dark" onClick={openNew}><i className="bi bi-plus-lg me-2"/>New Customer</button>}/>
  {showForm&&<CustomerForm initial={editing} onSaved={()=>{setShowForm(false);load()}} onCancel={()=>setShowForm(false)}/>}
  <section className="panel-card">
   <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3"><h5 className="mb-0">Customer List</h5><div className="input-group search-box"><span className="input-group-text bg-white"><i className="bi bi-search"/></span><input className="form-control" placeholder="Search name or phone..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div>
   {loading?<Loading/>:filtered.length?filtered.map(c=><CustomerCard key={c._id} c={c} onEdit={edit} onDelete={remove} onDetails={()=>setSelected(c)}/>):<Empty text="No matching customers found."/>}
  </section>
  {selected&&<PaymentModal customer={selected} onClose={()=>setSelected(null)} onSaved={()=>{setSelected(null);load()}}/>}
 </AppShell>
}

function CustomerForm({initial,onSaved,onCancel}){
 const [f,setF]=useState({customerName:initial?.customerName||"",phone:initial?.phone||"",weddingDate:initial?.weddingDate||"",totalAmount:initial?.totalAmount||"",advanceAmount:initial?.payments?.reduce((s,p)=>s+Number(p.amount||0),0)||initial?.advanceAmount||"",advancePaymentDate:"",advancePaymentMethod:"Cash",services:initial?.services||[]});
 const [saving,setSaving]=useState(false), [error,setError]=useState("");
 const set=(k,v)=>setF(x=>({...x,[k]:v}));
 const balance=Math.max(Number(f.totalAmount||0)-Number(f.advanceAmount||0),0);
 async function submit(e){e.preventDefault();setError("");if(!f.customerName||!f.phone||Number(f.totalAmount)<=0)return setError("Please enter customer name, phone and total package amount.");if(Number(f.advanceAmount)>Number(f.totalAmount))return setError("Advance cannot be greater than total amount.");if(Number(f.advanceAmount)>0&&!f.advancePaymentDate&&!initial)return setError("Please select advance payment date.");
  setSaving(true);try{
   if(initial){
    const paid=initial.payments?.reduce((s,p)=>s+Number(p.amount||0),0)||0;
    if(paid>Number(f.totalAmount))throw new Error("New package amount cannot be less than the amount already paid.");
    await apiFetch(`/customers/${initial._id}`,{method:"PUT",body:JSON.stringify({customerName:f.customerName,phone:f.phone,weddingDate:f.weddingDate,totalAmount:Number(f.totalAmount),advanceAmount:paid,balanceAmount:Math.max(Number(f.totalAmount)-paid,0),services:f.services})});
   }else{
    await apiFetch("/customers",{method:"POST",body:JSON.stringify({customerName:f.customerName,phone:f.phone,weddingDate:f.weddingDate,totalAmount:Number(f.totalAmount),advanceAmount:Number(f.advanceAmount||0),balanceAmount:balance,services:f.services,payments:Number(f.advanceAmount)>0?[{amount:Number(f.advanceAmount),date:f.advancePaymentDate,method:f.advancePaymentMethod}]:[]})});
   }
   onSaved();
  }catch(e){setError(e.message)}finally{setSaving(false)}
 }
 function toggle(s){set("services",f.services.includes(s)?f.services.filter(x=>x!==s):[...f.services,s])}
 return <section className="panel-card mb-4 form-accent"><div className="section-title"><h5><i className="bi bi-person-plus me-2"/>{initial?"Edit Customer":"New Customer"}</h5><button className="btn btn-sm btn-light" onClick={onCancel}><i className="bi bi-x-lg"/></button></div>
 {error&&<div className="alert alert-danger">{error}</div>}
 <form onSubmit={submit}><div className="row g-3">
  <Field label="Customer name" value={f.customerName} onChange={v=>set("customerName",v)}/>
  <Field label="Phone number" value={f.phone} onChange={v=>set("phone",v)}/>
  <Field label="Wedding date" type="date" value={f.weddingDate} onChange={v=>set("weddingDate",v)}/>
  <Field label="Total package amount" type="number" value={f.totalAmount} onChange={v=>set("totalAmount",v)}/>
  {!initial&&<Field label="Advance amount" type="number" value={f.advanceAmount} onChange={v=>set("advanceAmount",v)}/>}
  {!initial&&Number(f.advanceAmount)>0&&<><Field label="Advance payment date" type="date" value={f.advancePaymentDate} onChange={v=>set("advancePaymentDate",v)}/><div className="col-md-6"><label className="form-label fw-semibold">Payment method</label><select className="form-select form-select-lg" value={f.advancePaymentMethod} onChange={e=>set("advancePaymentMethod",e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option></select></div></>}
  <div className="col-12"><div className="balance-box-modern"><span>Current balance</span><strong>{money(initial?Math.max(Number(f.totalAmount)-Number(initial.advanceAmount||0),0):balance)}</strong></div></div>
  <div className="col-12"><label className="form-label fw-semibold">Services</label><div className="service-grid">{servicesList.map(s=><label className={`service-chip ${f.services.includes(s)?"selected":""}`} key={s}><input type="checkbox" checked={f.services.includes(s)} onChange={()=>toggle(s)}/>{s}</label>)}</div></div>
 </div><div className="d-flex gap-2 mt-4"><button className="btn btn-dark px-4" disabled={saving}>{saving?"Saving...":initial?"Update Customer":"Save Customer"}</button><button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button></div></form></section>
}
function Field({label,value,onChange,type="text"}){return <div className="col-md-6"><label className="form-label fw-semibold">{label}</label><input className="form-control form-control-lg" type={type} value={value} onChange={e=>onChange(e.target.value)} required={["customerName","phone","totalAmount"].includes(label==="Customer name"?"customerName":label==="Phone number"?"phone":label==="Total package amount"?"totalAmount":"")} /></div>}
function CustomerCard({c,onEdit,onDelete,onDetails}){const paid=c.payments?.length?c.payments.reduce((s,p)=>s+Number(p.amount||0),0):Number(c.advanceAmount||0);const balance=Math.max(Number(c.totalAmount||0)-paid,0);return <div className="customer-card-modern"><div className="d-flex justify-content-between gap-3"><div className="d-flex gap-3"><div className="avatar soft">{c.customerName?.slice(0,1).toUpperCase()}</div><div><h5 className="mb-1">{c.customerName}</h5><div className="text-secondary small"><i className="bi bi-telephone me-1"/>{c.phone} · <i className="bi bi-calendar3 ms-1 me-1"/>{dateText(c.weddingDate)}</div></div></div><span className={`status-pill ${balance?"warning":"success"}`}>{balance?`${money(balance)} due`:"Paid"}</span></div><div className="mini-metrics mt-3"><div><small>Total</small><strong>{money(c.totalAmount)}</strong></div><div><small>Paid</small><strong className="text-success">{money(paid)}</strong></div><div><small>Balance</small><strong className="text-danger">{money(balance)}</strong></div></div><div className="d-flex flex-wrap gap-2 mt-3"><Link className="btn btn-sm btn-dark" to={`/customers/${c._id}`}><i className="bi bi-eye me-1"/>Details</Link><button className="btn btn-sm btn-outline-dark" onClick={()=>onDetails(c)}><i className="bi bi-credit-card me-1"/>Payment</button><button className="btn btn-sm btn-outline-secondary" onClick={()=>onEdit(c)}><i className="bi bi-pencil me-1"/>Edit</button><button className="btn btn-sm btn-outline-danger" onClick={()=>onDelete(c)}><i className="bi bi-trash me-1"/>Delete</button></div></div>}
function PaymentModal({customer,onClose,onSaved}){const [amount,setAmount]=useState(""),[date,setDate]=useState(new Date().toISOString().slice(0,10)),[method,setMethod]=useState("Cash"),[error,setError]=useState(""),[saving,setSaving]=useState(false);const paid=customer.payments?.reduce((s,p)=>s+Number(p.amount||0),0)||0,balance=Math.max(Number(customer.totalAmount)-paid,0);async function submit(e){e.preventDefault();if(Number(amount)<=0||Number(amount)>balance)return setError("Enter an amount within the current balance.");setSaving(true);try{await apiFetch(`/customers/${customer._id}/payments`,{method:"POST",body:JSON.stringify({amount:Number(amount),date,method})});onSaved()}catch(e){setError(e.message)}finally{setSaving(false)}}return <div className="modal-backdrop-custom"><div className="modal-card-custom"><div className="section-title"><h5>Add Payment</h5><button className="btn btn-light" onClick={onClose}><i className="bi bi-x"/></button></div><div className="alert alert-light border"><strong>{customer.customerName}</strong><div className="small text-secondary">Balance: {money(balance)}</div></div>{error&&<div className="alert alert-danger">{error}</div>}<form onSubmit={submit}><Field label="Amount" type="number" value={amount} onChange={setAmount}/><div className="mb-3"><label className="form-label fw-semibold">Date</label><input className="form-control" type="date" value={date} onChange={e=>setDate(e.target.value)} required/></div><div className="mb-3"><label className="form-label fw-semibold">Method</label><select className="form-select" value={method} onChange={e=>setMethod(e.target.value)}><option>Cash</option><option>UPI</option><option>Card</option><option>Bank Transfer</option></select></div><button className="btn btn-dark w-100" disabled={saving}>{saving?"Saving...":"Add Payment"}</button></form></div></div>}
