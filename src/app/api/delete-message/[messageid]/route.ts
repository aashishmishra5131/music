import UserModel from '@/model/User'
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/db.Connect';
import { authOptions } from '../../auth/[...nextauth]/options';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  await dbConnect();

  const session = await getServerSession(authOptions);
  const _user = session?.user;

  if (!session || !_user) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  try {
    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (updateResult.modifiedCount === 0) {
      return new NextResponse(
        JSON.stringify({
          message: 'Message not found or already deleted',
          success: false,
        }),
        { status: 404 }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: 'Message deleted', success: true }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Error deleting message', success: false }),
      { status: 500 }
    );
  }
}
