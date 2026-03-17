import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { SquareClient } from "square";

/* -------------------------------- */
/* Square Client                    */
/* -------------------------------- */

const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { sourceId, orderId, locationId, tipCents } = body;

    if (!sourceId || !orderId || !locationId) {
      return NextResponse.json(
        { error: "Missing sourceId, orderId, or locationId" },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Get order to verify total        */
    /* -------------------------------- */

    const orderResponse = await squareClient.orders.get({ orderId });
    const order = orderResponse.order;

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    const totalAmount = order.totalMoney?.amount;
    if (totalAmount === undefined || totalAmount === null) {
      return NextResponse.json(
        { error: "Invalid order total" },
        { status: 400 }
      );
    }

    const amountBigInt =
      typeof totalAmount === "bigint" ? totalAmount : BigInt(totalAmount);
    if (amountBigInt <= BigInt(0)) {
      return NextResponse.json(
        { error: "Order total must be greater than zero" },
        { status: 400 }
      );
    }

    /* -------------------------------- */
    /* Create payment                   */
    /* -------------------------------- */

    const tipAmount =
      typeof tipCents === "number" && tipCents > 0
        ? BigInt(Math.round(tipCents))
        : undefined;

    const paymentResponse = await squareClient.payments.create({
      idempotencyKey: randomUUID(),
      sourceId,
      amountMoney: {
        amount: amountBigInt,
        currency: "USD",
      },
      ...(tipAmount && tipAmount > BigInt(0) && {
        tipMoney: {
          amount: tipAmount,
          currency: "USD",
        },
      }),
      orderId,
      locationId,
      autocomplete: true,
    });

    const payment = paymentResponse.payment;

    if (!payment) {
      return NextResponse.json(
        { error: "Payment failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentId: payment.id,
      status: payment.status,
    });
  } catch (error: unknown) {
    console.error("Payment failed:", error);
    return NextResponse.json(
      { error: "Payment failed. Please try again." },
      { status: 500 }
    );
  }
}
