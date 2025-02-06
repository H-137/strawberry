import { connectToDatabase } from "@/lib/mongodb";
import Counter from "@/models/Counter";

// Handle both GET and POST requests
export async function GET() {
  await connectToDatabase();

  let counter = await Counter.findOne();
  if (!counter) {
    counter = new Counter({ value: 0 });
    await counter.save();
  }

  return Response.json({ value: counter.value });
}

export async function POST() {
  await connectToDatabase();

  let counter = await Counter.findOne();
  if (!counter) {
    counter = new Counter({ value: 0 });
  }

  counter.value += 1;
  await counter.save();

  return Response.json({ value: counter.value });
}
