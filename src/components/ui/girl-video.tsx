"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Video } from "@prisma/client";
import VideoPlayer from "react-player";
import screenfull from "screenfull";
import { Fullscreen, Lock, Pause, Play } from "lucide-react";
import { cn, formatDuration, getImage } from "@/lib/utils";
import type { User } from "lucia";

type VideoProps = {
    user: User | null;
    video: Video;
    className?: string;
};

type LockedProps = {
    src: string;
    width: number;
    height: number;
};

const VideoEl: React.FC<VideoProps> = ({ user, video, className }) => {
    const videoPlayer = useRef<VideoPlayer>(null);
    const [showPanel, setShowPanel] = useState<boolean>(false);
    const [playing, setPlaying] = useState<boolean>(false);
    const [track, setTrack] = useState<number>(0);

    const handlePlay = () => {
        setPlaying((e) => !e);
    };

    const handleFullscreen = () => {
        screenfull.request(document.querySelector(".video-player") as Element);
        screenfull.toggle(document.querySelector(".video-player") as Element);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        videoPlayer.current?.seekTo(v);
        setTrack(v);
    };

    const canSee = video.free || user?.subscriptionStatus === "active";

    return canSee ?
            <div
                className="video-player relative aspect-video flex items-center justify-center rounded-sm overflow-hidden cursor-pointer"
                onMouseEnter={() => setShowPanel(true)}
                onMouseLeave={() => setShowPanel(false)}
            >
                {(showPanel || !playing) && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-10 bg-secondary/50 rounded-full">
                        {playing ?
                            <Pause className="fill-white size-5" />
                        :   <Play className="fill-white size-5" />}
                    </div>
                )}
                <div onClick={handlePlay}>
                    <VideoPlayer
                        ref={videoPlayer}
                        className={cn(
                            "size-full overflow-hidden rounded-xl cursor-pointer",
                            className
                        )}
                        url={getImage(video.src)}
                        playing={playing}
                        onPlay={() => setPlaying(true)}
                        onPause={() => setPlaying(false)}
                        onProgress={(e) => setTrack(e.playedSeconds)}
                    />
                </div>
                <div
                    className={cn(
                        "p-2 w-full absolute bottom-0 opacity-0 transition-all",
                        (showPanel || !playing) && "opacity-100"
                    )}
                >
                    <div className="flex items-center w-full p-1 px-2 space-x-2 bg-base-200 rounded-xl">
                        <button
                            className="btn btn-sm btn-ghost btn-square rounded-md"
                            onClick={handlePlay}
                        >
                            {playing ?
                                <Pause className="fill-white size-5" />
                            :   <Play className="fill-white size-5" />}
                        </button>
                        <input
                            type="range"
                            min={0}
                            max={video.time}
                            step={0.01}
                            value={track}
                            onChange={handleSeek}
                            className="px-2 h-4 range range-xs range-secondary rounded-full"
                        />
                        <span className="flex items-center gap-x-1 font-mono">
                            {formatDuration(track)}
                            <div>/</div>
                            {formatDuration(video.time)}
                        </span>
                        <button
                            className="btn btn-sm btn-ghost btn-square rounded-md"
                            onClick={handleFullscreen}
                        >
                            <Fullscreen />
                        </button>
                    </div>
                </div>
            </div>
        :   <Locked
                src={video.blurred}
                width={video.width}
                height={video.height}
            />;
};

const Locked: React.FC<LockedProps> = ({ src, width, height }) => {
    return (
        <div className="relative size-full overflow-hidden rounded-xl">
            <Image
                src={getImage(src)}
                alt="Locked"
                width={width}
                height={height}
                className="w-full h-full object-cover"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-10 bg-secondary/50 rounded-full">
                <Lock className="text-white size-5" />
            </div>
        </div>
    );
};

export default VideoEl;
