export async function fetchVMs() {
  try {
    const res = await fetch('http://localhost:3002/api/all_vm_status', {
      cache: 'no-store',
    });

    const data = await res.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Failed to fetch VMs:', error);
    return [];
  }
}
