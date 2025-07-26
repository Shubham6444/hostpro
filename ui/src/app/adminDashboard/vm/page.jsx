'use client';

import { useEffect, useState } from 'react';
import { fetchVMs } from '../apicall/vmstatus';

export default function VmStatus() {
  const [vms, setVms] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchVMs().then((data) => {
      setVms(data);
      setFiltered(data);
    });
  }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    const results = vms.filter((vm) =>
      Object.values(vm).some((val) => {
        if (typeof val === 'string') return val.toLowerCase().includes(q);
        if (typeof val === 'object' && val !== null) {
          return Object.values(val).some((v) => typeof v === 'string' && v.toLowerCase().includes(q));
        }
        return false;
      })
    );
    setFiltered(results);
  }, [query, vms]);

  return (
    <div className="mt-20 px-4">
      <input
        type="text"
        placeholder="Search VM (name, ID, IP, domain...)"
        className="w-full max-w-md mb-6 px-4 py-2 text-sm rounded bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {filtered.length === 0 ? (
        <div className="text-center text-white py-10">No matching virtual machines found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm bg-white/10 text-white rounded-xl backdrop-blur-md shadow-md">
            <thead className="bg-white/20 text-left text-xs uppercase text-gray-300">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Container ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Domain</th>
                <th className="p-3">SSH</th>
                <th className="p-3">HTTP</th>
                <th className="p-3">IP</th>
                <th className="p-3">Network</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((vm, index) => {
                const ip = vm?.network?.ipAddress || 'N/A';
                const created = vm?.createdAt ? new Date(vm.createdAt).toLocaleString('en-IN') : 'Unknown';

                return (
                  <tr
                    key={vm.containerId || index}
                    className="border-b border-white/10 hover:bg-white/10 transition"
                  >
                    <td className="p-3 font-medium">{vm.containerName || 'Unnamed'}</td>
                    <td className="p-3">{vm.username}</td>
                    <td className="p-3 break-all max-w-[200px]">{vm.containerId}</td>
                   <td className={`p-3 font-bold ${
  vm.status === 'running' ? 'text-green-400' : 'text-red-400'
}`}>
  {vm.status}
</td>

                    <td className="p-3">{vm.domain || vm.subdomain + '.remixorbit.in'}</td>
                    <td className="p-3">{vm.sshPort}</td>
                    <td className="p-3">{vm.httpPort}</td>
                    <td className="p-3">{ip}</td>
                    <td className="p-3">
                      {vm.network?.name || '-'}<br />
                      <span className="text-xs text-gray-400">{vm.network?.subnet || '-'}</span>
                    </td>
                    <td className="p-3">{created}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
