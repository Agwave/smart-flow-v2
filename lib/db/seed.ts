import { db, client } from "./index";
import { users, orders, orderItems, logistics } from "./schema";
import { sql } from "drizzle-orm";

const ADMIN_USER_ID = "admin";

const ordersData = [
  {
    id: "202603010001",
    status: "已签收",
    totalAmount: 999900,
    createdAt: new Date("2026-03-01T14:30:00"),
    updatedAt: new Date("2026-03-03T10:25:00"),
  },
  {
    id: "202602280002",
    status: "配送中",
    totalAmount: 129900,
    createdAt: new Date("2026-02-28T09:15:00"),
    updatedAt: new Date("2026-03-05T08:00:00"),
  },
  {
    id: "202602250003",
    status: "退款处理中",
    totalAmount: 29900,
    createdAt: new Date("2026-02-25T20:00:00"),
    updatedAt: new Date("2026-02-26T10:00:00"),
  },
  {
    id: "202602200004",
    status: "已发货",
    totalAmount: 459900,
    createdAt: new Date("2026-02-20T11:30:00"),
    updatedAt: new Date("2026-02-22T14:00:00"),
  },
  {
    id: "202602150005",
    status: "已签收",
    totalAmount: 89900,
    createdAt: new Date("2026-02-15T08:45:00"),
    updatedAt: new Date("2026-02-18T16:30:00"),
  },
  {
    id: "202602100006",
    status: "已签收",
    totalAmount: 199900,
    createdAt: new Date("2026-02-10T19:20:00"),
    updatedAt: new Date("2026-02-13T09:15:00"),
  },
  {
    id: "202602050007",
    status: "待支付",
    totalAmount: 159900,
    createdAt: new Date("2026-02-05T10:00:00"),
    updatedAt: new Date("2026-02-05T10:00:00"),
  },
  {
    id: "202601280008",
    status: "已签收",
    totalAmount: 69900,
    createdAt: new Date("2026-01-28T15:45:00"),
    updatedAt: new Date("2026-01-31T11:20:00"),
  },
  {
    id: "202601200009",
    status: "已签收",
    totalAmount: 329900,
    createdAt: new Date("2026-01-20T12:00:00"),
    updatedAt: new Date("2026-01-24T08:45:00"),
  },
  {
    id: "202601150010",
    status: "已签收",
    totalAmount: 129900,
    createdAt: new Date("2026-01-15T09:30:00"),
    updatedAt: new Date("2026-01-18T14:10:00"),
  },
];

const orderItemsData = [
  { orderId: "202603010001", items: [{ name: "Apple iPhone 16 Pro Max 256GB 沙漠钛金色", qty: 1, price: 999900 }] },
  { orderId: "202602280002", items: [{ name: "Nike Air Max 270 运动鞋 黑色 42码", qty: 1, price: 109900 }, { name: "Nike 运动袜 3双装", qty: 1, price: 20000 }] },
  { orderId: "202602250003", items: [{ name: "小米电动牙刷 T700", qty: 1, price: 29900 }] },
  { orderId: "202602200004", items: [{ name: "戴森吹风机 HD15 紫红色", qty: 1, price: 319900 }, { name: "戴森收纳架", qty: 1, price: 140000 }] },
  { orderId: "202602150005", items: [{ name: "SK-II 神仙水 230ml", qty: 1, price: 89900 }] },
  { orderId: "202602100006", items: [{ name: "AirPods Pro 2 代", qty: 1, price: 179900 }, { name: "AirPods 保护套", qty: 1, price: 20000 }] },
  { orderId: "202602050007", items: [{ name: "索尼 WH-1000XM5 头戴式耳机", qty: 1, price: 159900 }] },
  { orderId: "202601280008", items: [{ name: "飞利浦电动剃须刀 S5091", qty: 1, price: 69900 }] },
  { orderId: "202601200009", items: [{ name: "MacBook Air M3 13寸 8+256GB", qty: 1, price: 299900 }, { name: "MacBook 保护套", qty: 1, price: 30000 }] },
  { orderId: "202601150010", items: [{ name: "iPad Pro 11寸 M4 256GB", qty: 1, price: 129900 }] },
];

const logisticsData = [
  {
    orderId: "202603010001",
    company: "顺丰速运",
    trackingNo: "SF1234567890",
    status: "已签收",
    lastUpdate: "2026-03-03 10:25:00 已签收，签收人：本人",
  },
  {
    orderId: "202602280002",
    company: "中通快递",
    trackingNo: "ZT9876543210",
    status: "配送中",
    lastUpdate: "2026-03-05 08:00:00 [北京市] 快递员正在派送中",
  },
  {
    orderId: "202602250003",
    company: "",
    trackingNo: "",
    status: "无物流",
    lastUpdate: "退款处理中，暂无物流信息",
  },
  {
    orderId: "202602200004",
    company: "京东快递",
    trackingNo: "JD20260301001",
    status: "已发货",
    lastUpdate: "2026-02-22 14:00:00 [上海] 商品已发出，正在配送途中",
  },
  {
    orderId: "202602150005",
    company: "顺丰速运",
    trackingNo: "SF20260302002",
    status: "已签收",
    lastUpdate: "2026-02-18 16:30:00 已签收，签收人：本人",
  },
  {
    orderId: "202602100006",
    company: "韵达快递",
    trackingNo: "YD20260303003",
    status: "已签收",
    lastUpdate: "2026-02-13 09:15:00 已签收，签收人：家人",
  },
  {
    orderId: "202602050007",
    company: "",
    trackingNo: "",
    status: "无物流",
    lastUpdate: "待支付，支付后可查看物流信息",
  },
  {
    orderId: "202601280008",
    company: "圆通速递",
    trackingNo: "YT20260304004",
    status: "已签收",
    lastUpdate: "2026-01-31 11:20:00 已签收，签收人：本人",
  },
  {
    orderId: "202601200009",
    company: "顺丰速运",
    trackingNo: "SF20260305005",
    status: "已签收",
    lastUpdate: "2026-01-24 08:45:00 已签收，签收人：本人",
  },
  {
    orderId: "202601150010",
    company: "京东快递",
    trackingNo: "JD20260306006",
    status: "已签收",
    lastUpdate: "2026-01-18 14:10:00 已签收，签收人：快递柜",
  },
];

async function checkTableExists(tableName: string): Promise<boolean> {
  const result = await db.all(sql`SELECT name FROM sqlite_master WHERE type='table' AND name=${tableName}`);
  return result.length > 0;
}

async function createTables() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      status TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS logistics (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      company TEXT NOT NULL,
      tracking_no TEXT NOT NULL,
      status TEXT NOT NULL,
      last_update TEXT NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  await db.run(sql`
    CREATE TABLE IF NOT EXISTS return_applications (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      type TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);
}

export async function initializeDatabase() {
  const tableExists = await checkTableExists("users");

  if (!tableExists) {
    console.log("[DB] 表不存在，开始初始化...");

    await createTables();

    await db.insert(users).values({
      id: ADMIN_USER_ID,
      phone: "13800138000",
      name: "Admin 用户",
      createdAt: new Date(),
    });

    for (const order of ordersData) {
      await db.insert(orders).values({
        id: order.id,
        userId: ADMIN_USER_ID,
        status: order.status,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      });
    }

    let itemId = 1;
    for (const orderItem of orderItemsData) {
      for (const item of orderItem.items) {
        await db.insert(orderItems).values({
          id: `item-${itemId++}`,
          orderId: orderItem.orderId,
          productName: item.name,
          quantity: item.qty,
          price: item.price,
        });
      }
    }

    let logisticsId = 1;
    for (const log of logisticsData) {
      await db.insert(logistics).values({
        id: `log-${logisticsId++}`,
        orderId: log.orderId,
        company: log.company,
        trackingNo: log.trackingNo,
        status: log.status,
        lastUpdate: log.lastUpdate,
      });
    }

    console.log("[DB] 初始化完成！");
  } else {
    console.log("[DB] 表已存在，跳过初始化");
  }
}

export async function closeDatabase() {
  await client.close();
}
