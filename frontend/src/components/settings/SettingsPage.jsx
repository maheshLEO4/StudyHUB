import React, { useState } from 'react';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useApi } from '../../hooks/useApi';
import Icon from '../shared/Icon';
import Spinner from '../shared/Spinner';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const { theme, toggle }   = useTheme();
  const { execute, loading } = useApi();
  const [name, setName]     = useState(user?.name||'');
  const [pwForm, setPwForm] = useState({ currentPassword:'',newPassword:'',confirm:'' });
  const [pwError, setPwError] = useState('');

  const saveProfile = async () => {
    if (!name?.trim()) return;
    const r = await execute(()=>authAPI.updateMe({name}),{successMsg:'Profile updated'});
    updateUser(r.user);
  };

  const changePassword = async () => {
    setPwError('');
    if (pwForm.newPassword!==pwForm.confirm) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length<6) { setPwError('Password must be at least 6 characters'); return; }
    try {
      await execute(()=>authAPI.changePassword({currentPassword:pwForm.currentPassword,newPassword:pwForm.newPassword}),{successMsg:'Password changed'});
      setPwForm({currentPassword:'',newPassword:'',confirm:''});
    } catch {}
  };

  return (
    <div>
      <div className="page-header"><div className="page-title">Settings</div></div>
      <div style={{maxWidth:540}}>
        {/* Profile */}
        <div className="card mb-4">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Profile</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={name} onChange={e=>setName(e.target.value)}/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email||''} disabled style={{opacity:.7}}/></div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>{loading?<Spinner size={15}/>:'Save Changes'}</button>
        </div>

        {/* Theme */}
        <div className="card mb-4">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Appearance</div>
          <div className="flex items-center justify-between">
            <div>
              <div style={{fontWeight:600}}>Dark Mode</div>
              <div className="text-sm text-muted">Currently: {theme==='dark'?'Dark':'Light'}</div>
            </div>
            <button className="btn btn-secondary" onClick={toggle}><Icon name={theme==='light'?'moon':'sun'} size={15}/>{theme==='light'?'Enable Dark':'Enable Light'}</button>
          </div>
        </div>

        {/* Password */}
        <div className="card">
          <div style={{fontWeight:700,fontSize:15,marginBottom:16}}>Change Password</div>
          {pwError&&<div className="alert alert-error mb-3">{pwError}</div>}
          <div className="form-group"><label className="form-label">Current Password</label><input className="form-control" type="password" placeholder="••••••••" value={pwForm.currentPassword} onChange={e=>setPwForm(f=>({...f,currentPassword:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">New Password</label><input className="form-control" type="password" placeholder="••••••••" value={pwForm.newPassword} onChange={e=>setPwForm(f=>({...f,newPassword:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-control" type="password" placeholder="••••••••" value={pwForm.confirm} onChange={e=>setPwForm(f=>({...f,confirm:e.target.value}))}/></div>
          <button className="btn btn-primary" onClick={changePassword} disabled={loading}>{loading?<Spinner size={15}/>:'Change Password'}</button>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
