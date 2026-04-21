import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user?.category === "IC") {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    const body = await request.json();
    const { reagenteId, quantidade, observacoes } = body;

    const saida = await prisma.reagenteSaida.create({
      data: {
        reagenteId,
        usuarioId: session.user.id,
        dataSaida: new Date(),
        quantidade,
        observacoes,
      },
      include: { reagente: true },
    });

    return NextResponse.json(saida, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Erro ao registrar saída" },
      { status: 500 }
    );
  }
}