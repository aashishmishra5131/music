import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/db.Connect';
import UserModel from '@/model/User';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized. Please login first.' },
      { status: 401 }
    );
  }

  try {
    const user = await UserModel.findById(session.user._id).select(
      '-password -verifyCode -verifyCodeExpiry'
    );

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          isVerified: user.isVerified,
          isAcceptingMessage: user.isAcceptingMessage,
          messagesCount: user.messages.length,
          createdAt: (user as any).createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, message: 'Error fetching profile' },
      { status: 500 }
    );
  }
}
