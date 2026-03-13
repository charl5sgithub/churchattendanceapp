import type { Request, Response } from "express";
import { prisma } from "../utils/prisma";

export async function listMembers(_req: Request, res: Response) {
  const members = await prisma.member.findMany({
    orderBy: { name: "asc" }
  });
  return res.json(members);
}

export async function createMember(req: Request, res: Response) {
  const { name, phone, email, family, joinDate } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    family?: string;
    joinDate?: string;
  };

  if (!name || !joinDate) {
    return res
      .status(400)
      .json({ error: "Name and joinDate are required fields" });
  }

  const member = await prisma.member.create({
    data: {
      name,
      phone,
      email,
      family,
      joinDate: new Date(joinDate)
    }
  });

  return res.status(201).json(member);
}

export async function updateMember(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { name, phone, email, family, joinDate } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    family?: string;
    joinDate?: string;
  };

  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Member not found" });
  }

  const updated = await prisma.member.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      phone: phone ?? existing.phone,
      email: email ?? existing.email,
      family: family ?? existing.family,
      joinDate: joinDate ? new Date(joinDate) : existing.joinDate
    }
  });

  return res.json(updated);
}

export async function deleteMember(req: Request, res: Response) {
  const id = Number(req.params.id);

  const existing = await prisma.member.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Member not found" });
  }

  await prisma.attendance.deleteMany({ where: { memberId: id } });
  await prisma.member.delete({ where: { id } });

  return res.status(204).send();
}

