// utils/dockerNetwork.js
const Docker = require("dockerode");
const crypto = require("crypto");
const docker = new Docker();

function generateNetworkName(userId) {
  const hash = crypto.createHash("sha256").update(userId).digest("hex").slice(0, 12);
  return `net_${hash}`;
}

function generateSubnetFromHash(userId) {
  const hash = crypto.createHash("md5").update(userId).digest("hex").slice(0, 4);
  const base = 100 + (parseInt(hash, 16) % 100);
  return {
    subnet: `172.${base}.0.0/16`,
    gateway: `172.${base}.0.1`,
  };
}

async function createDockerNetwork(userId) {
  const name = generateNetworkName(userId);
  const { subnet, gateway } = generateSubnetFromHash(userId);

  const networks = await docker.listNetworks();
  const exists = networks.some((n) => n.Name === name);

  if (exists) {
    return { success: true, message: `Network '${name}' already exists.`, name, subnet };
  }

  await docker.createNetwork({
    Name: name,
    Driver: "bridge",
      Attachable: true, // 👈 enable dynamic container joins

    IPAM: {
      Config: [{ Subnet: subnet, Gateway: gateway }],
    },
  });

  return { success: true, message: `Network '${name}' created.`, name, subnet };
}

module.exports = {
  createDockerNetwork, // ✅ this is important
  generateNetworkName,
};
