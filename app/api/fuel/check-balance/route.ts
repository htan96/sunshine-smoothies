import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { squareClient } from "@/lib/square/client";

type FuelSize = "MEDIUM" | "LARGE" | "XL" | "JUMBO";

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  if (phone.startsWith("+")) {
    return phone;
  }

  return `+${digits}`;
}

export async function POST(req: NextRequest) {
  try {
    const { phone, size } = (await req.json()) as {
      phone: string;
      size?: FuelSize;
    };

    if (!phone) {
      return NextResponse.json({
        allowed: false,
        message: "Phone number required",
      });
    }

    const normalizedPhone = normalizePhone(phone);

    // Search Square customer
    const searchResponse = await squareClient.customers.search({
      query: {
        filter: {
          phoneNumber: {
            exact: normalizedPhone,
          },
        },
      },
    });

    const customer = searchResponse.customers?.[0];

    if (!customer) {
      return NextResponse.json({
        allowed: false,
        message: "Customer not found",
        balances: {
          medium: 0,
          large: 0,
          xl: 0,
          jumbo: 0,
        },
      });
    }

    // Lookup wallet by phone
    const { data: balance, error } = await supabase
      .from("customer_fuel_balances")
      .select("*")
      .eq("phone", normalizedPhone)
      .single();

    if (error || !balance) {
      return NextResponse.json({
        allowed: false,
        message: "No fuel balance found",
        squareCustomerId: customer.id,
        phone: normalizedPhone,
        balances: {
          medium: 0,
          large: 0,
          xl: 0,
          jumbo: 0,
        },
      });
    }

    const balances = {
      medium: balance.fuel_medium ?? 0,
      large: balance.fuel_large ?? 0,
      xl: balance.fuel_xl ?? 0,
      jumbo: balance.fuel_jumbo ?? 0,
    };

    // If only checking balance
    if (!size) {
      return NextResponse.json({
        allowed: true,
        squareCustomerId: customer.id,
        phone: normalizedPhone,
        balances,
      });
    }

    const sizeMap: Record<FuelSize, number> = {
      MEDIUM: balances.medium,
      LARGE: balances.large,
      XL: balances.xl,
      JUMBO: balances.jumbo,
    };

    const remaining = sizeMap[size];

    if (remaining <= 0) {
      return NextResponse.json({
        allowed: false,
        message: "No drinks remaining",
        remaining,
        squareCustomerId: customer.id,
        phone: normalizedPhone,
        balances,
      });
    }

    return NextResponse.json({
      allowed: true,
      remaining,
      squareCustomerId: customer.id,
      phone: normalizedPhone,
      balances,
    });

  } catch (error) {
    console.error("Fuel balance check failed:", error);

    return NextResponse.json(
      {
        allowed: false,
        message: "Server error",
        balances: {
          medium: 0,
          large: 0,
          xl: 0,
          jumbo: 0,
        },
      },
      { status: 500 }
    );
  }
}