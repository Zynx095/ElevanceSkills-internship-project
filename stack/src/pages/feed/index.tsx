import React, {
    useEffect,
    useState
} from "react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import {
    likePost,
    commentPost,
    sharePost,
    deletePost
} from "@/lib/postApi";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    createPost,
    getPosts
} from "@/lib/postApi";


const Feed = () => {

    const [posts, setPosts] =
        useState([]);

    const [caption, setCaption] =
        useState("");

    const [mediaUrl, setMediaUrl] =
        useState("");

    const [mediaType, setMediaType] =
        useState("image");
    const [commentText, setCommentText] =
        useState<Record<string, string>>({});
    const [uploading, setUploading] =
        useState(false);

    const loadPosts =
        async () => {

            const data =
                await getPosts();

            setPosts(data);

        };

    useEffect(() => {
        loadPosts();
    }, []);
    const uploadToCloudinary =
        async (file: File) => {

            setUploading(true);

            const formData =
                new FormData();

            formData.append(
                "file",
                file
            );

            formData.append(
                "upload_preset",
                "stackoverflow_media"
            );

            const res =
                await fetch(
                    "https://api.cloudinary.com/v1_1/dx9onwwer/auto/upload",
                    {
                        method: "POST",
                        body: formData
                    }
                );

            const data =
                await res.json();

            setUploading(false);

            return data.secure_url;

        };

    const handleCreate =
        async () => {

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "{}"
                );

            await createPost({
                caption,
                mediaUrl,
                mediaType,
                userId:
                    user._id,
                userName:
                    user.name
            });

            setCaption("");
            setMediaUrl("");

            loadPosts();

        };
    const handleLike =
        async (postId: string) => {

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "{}"
                );

            await likePost(
                postId,
                user._id
            );

            loadPosts();
        };
    const handleComment =
        async (postId: string) => {

            const user =
                JSON.parse(
                    localStorage.getItem(
                        "user"
                    ) || "{}"
                );

            if (
                !commentText[postId]
            ) return;

            await commentPost(
                postId,
                {
                    userId:
                        user._id,
                    userName:
                        user.name,
                    comment:
                        commentText[
                        postId
                        ]
                }
            );

            setCommentText(
                {
                    ...commentText,
                    [postId]: ""
                }
            );

            loadPosts();

        };
    const handleShare =
        async (postId: string) => {

            await sharePost(
                postId
            );

            loadPosts();

        };
    const handleDelete =
        async (postId: string) => {

            await deletePost(
                postId
            );

            loadPosts();

        };

    return (
        <div className="max-w-3xl mx-auto p-4">

            <Card className="mb-4">

                <CardHeader>
                    <CardTitle>
                        Create Post
                    </CardTitle>
                </CardHeader>

                <CardContent>

                    <textarea
                        className="w-full border p-2 rounded mb-2"
                        rows={3}
                        value={caption}
                        onChange={(e) =>
                            setCaption(
                                e.target.value
                            )
                        }
                    />

                    <Input
                        type="file"
                        accept="image/*,video/*"
                        onChange={async (e) => {

                            const file =
                                e.target.files?.[0];

                            if (!file) return;

                            const url =
                                await uploadToCloudinary(
                                    file
                                );

                            setMediaUrl(url);

                            if (
                                file.type.startsWith(
                                    "video"
                                )
                            ) {

                                setMediaType(
                                    "video"
                                );

                            } else {

                                setMediaType(
                                    "image"
                                );

                            }

                        }}
                    />

                    <select
                        className="border p-2 rounded mt-2 mb-2 w-full"
                        value={mediaType}
                        onChange={(e) =>
                            setMediaType(
                                e.target.value
                            )
                        }
                    >
                        <option value="image">
                            Image
                        </option>

                        <option value="video">
                            Video
                        </option>
                    </select>

                    <Button
                        disabled={
                            uploading
                        }
                        onClick={
                            handleCreate
                        }
                    >
                        {
                            uploading
                                ? "Uploading..."
                                : "Post"
                        }
                    </Button>

                </CardContent>

            </Card>

            {
                posts.map(
                    (post: any) => (

                        <Card
                            key={post._id}
                            className="
        mb-6
        shadow-lg
        border-0
        overflow-hidden
    "
                        >

                            <CardHeader>

                                <div className="flex items-center gap-3">

                                    <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">

                                        {post.userName?.charAt(0).toUpperCase()}

                                    </div>

                                    <div>

                                        <h3 className="font-semibold">
                                            {post.userName}
                                        </h3>

                                        <p className="text-xs text-gray-500">
                                            {new Date(post.createdAt)
                                                .toLocaleString()}
                                        </p>

                                    </div>

                                </div>

                            </CardHeader>

                            <CardContent>

                                <p>
                                    {
                                        post.caption
                                    }
                                </p>

                                {
                                    post.mediaType ===
                                    "image" && (
                                        <img
                                            src={post.mediaUrl}
                                            className="
        mt-3
        rounded-xl
        w-full
        max-h-[500px]
        object-cover
        border
    "
                                        />
                                    )
                                }
                                {
                                    post.mediaType ===
                                    "video" && (

                                        <video
                                            controls
                                            className="
                mt-3
                rounded-xl
                w-full
            "
                                        >

                                            <source
                                                src={post.mediaUrl}
                                            />

                                        </video>

                                    )
                                }

                                <div className="flex gap-4 mt-4">

                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleLike(post._id)
                                        }
                                    >
                                        ❤️ {post.likes.length}
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() =>
                                            handleShare(post._id)
                                        }
                                    >
                                        🔁 {post.shareCount}
                                    </Button>

                                    <span className="flex items-center text-sm">

                                        💬 {post.comments.length}

                                    </span>

                                </div>

                                <div className="mt-3">

                                    <p>
                                        Comments:
                                        {
                                            post.comments.length
                                        }
                                    </p>

                                    <div className="flex gap-2 mt-2">

                                        <Input
                                            value={
                                                commentText[
                                                post._id
                                                ] || ""
                                            }
                                            placeholder="Write a comment..."
                                            onChange={(e) =>
                                                setCommentText({
                                                    ...commentText,
                                                    [post._id]:
                                                        e.target.value
                                                })
                                            }
                                        />

                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                handleComment(
                                                    post._id
                                                )
                                            }
                                        >
                                            Comment
                                        </Button>

                                    </div>

                                    <div className="mt-2">

                                        {
                                            post.comments.map(
                                                (
                                                    comment: any,
                                                    index: number
                                                ) => (

                                                    <div
                                                        key={index}
                                                        className="border rounded p-2 mb-1"
                                                    >

                                                        <strong>
                                                            {
                                                                comment.userName
                                                            }
                                                        </strong>

                                                        <p>
                                                            {
                                                                comment.comment
                                                            }
                                                        </p>

                                                    </div>

                                                )
                                            )
                                        }

                                    </div>

                                </div>

                                {
                                    JSON.parse(
                                        localStorage.getItem(
                                            "user"
                                        ) || "{}"
                                    )._id === post.userId && (

                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="mt-2"
                                            onClick={() =>
                                                handleDelete(
                                                    post._id
                                                )
                                            }
                                        >
                                            Delete Post
                                        </Button>

                                    )
                                }

                            </CardContent>

                        </Card>

                    )
                )
            }

        </div>
    );
};

export default Feed;