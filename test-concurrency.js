const body = {
  productId: "cmp2urj4a0002v49scl87it6w",
  warehouseId: "cmp16pb0j0001v4mopzxr3h7t",
  quantity: 1,
};

async function sendRequest() {
  const res = await fetch("http://localhost:3000/api/reservations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return {
    status: res.status,
    data,
  };
}

async function run() {
  const results = await Promise.allSettled([sendRequest(), sendRequest()]);

  console.log(JSON.stringify(results, null, 2));
}

run();
