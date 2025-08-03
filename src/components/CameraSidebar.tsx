import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { ASCII_CHARS, INITIAL_STATE } from "@/lib/constants";
import { CameraSettings, UseState } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ChevronsUp } from "lucide-react";
import { RefObject } from "preact";
import { useState } from "preact/hooks";
import { HexColorInput, HexColorPicker } from "react-colorful";

export default function Sidebar({
  sidebarState: [sidebarOpen, setSidebarOpen],
  settingsRef,
  resizeCanvas,
  asciiModeState: [asciiMode, setAsciiMode],
  renderAscii,
}: {
  sidebarState: UseState<boolean>;
  settingsRef: RefObject<CameraSettings>;
  resizeCanvas: () => void;
  asciiModeState: UseState<boolean>;
  renderAscii: () => void;
}) {
  const [sidebarBtnRotation, setSidebarBtnRotation] = useState(0);
  const [settings, setSettings] = useState<CameraSettings>(
    settingsRef.current!,
  );

  function handleChange(change: Partial<CameraSettings>) {
    settingsRef.current = {
      ...settingsRef.current!,
      ...change,
    };
    setSettings((prev) => ({
      ...prev,
      ...change,
    }));
    resizeCanvas();
  }

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={() => {
          setSidebarOpen((prev) => !prev);
          setSidebarBtnRotation((r) => r - 180);
        }}
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        className="absolute right-3 bottom-20 z-30 cursor-pointer md:top-3 md:-rotate-90"
      >
        <ChevronsUp
          className="h-6 w-6 transition-transform duration-200"
          style={{ transform: `rotate(${sidebarBtnRotation.toString()}deg)` }}
        />
      </Button>
      <aside
        className={cn(
          "fixed bottom-0 mb-24 flex h-1/3 w-full max-w-full flex-col border-t border-white/10 bg-black transition-transform duration-300 md:top-0 md:right-0 md:h-full md:w-80 md:border-l",
          sidebarOpen
            ? "translate-y-0 md:translate-x-0 md:translate-y-0"
            : "translate-y-full md:translate-x-full md:translate-y-0",
        )}
        style={{ willChange: "transform" }}
      >
        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6 md:mt-10">
          <div className="flex justify-between">
            <label
              className="text-sm font-medium text-white"
              htmlFor="ascii-mode"
            >
              ASCII Mode
            </label>
            <Switch
              id="ascii-mode"
              checked={asciiMode}
              onCheckedChange={(asciiMode) => {
                handleChange({ asciiMode });
                setAsciiMode(asciiMode);
                if (asciiMode) {
                  renderAscii();
                }
              }}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Character Set
            </label>
            <Select
              value={settings.chars}
              onValueChange={(chars: CameraSettings["chars"]) =>
                handleChange({ chars })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(ASCII_CHARS).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <label className="block text-sm font-medium text-white">
              Resolution
            </label>
            <Slider
              value={[settings.res]}
              onValueChange={([res]) => handleChange({ res })}
              max={2}
              min={0.5}
              step={0.05}
            />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm text-white">Contrast</label>
              <Slider
                value={[settings.contrast]}
                onValueChange={([contrast]) => handleChange({ contrast })}
                max={500}
                min={100}
                step={10}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm text-white">Brightness</label>
              <Slider
                value={[settings.brightness]}
                onValueChange={([brightness]) => handleChange({ brightness })}
                max={500}
                min={100}
                step={10}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                className="text-sm font-medium text-white"
                htmlFor="monocolor"
              >
                Monocolor
              </label>
              <Switch
                id="monocolor"
                checked={settings.colorMode}
                onCheckedChange={(colorMode) => handleChange({ colorMode })}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild disabled={!settings.colorMode}>
                <Button
                  disabled={!settings.colorMode}
                  className="w-full"
                  variant="outline"
                >
                  Choose Color
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit">
                <HexColorPicker
                  color={settings.color}
                  onChange={(color) => handleChange({ color })}
                />
                <HexColorInput
                  prefixed
                  color={settings.color}
                  onChange={(color) => handleChange({ color })}
                  className="mt-2 w-full"
                />
              </PopoverContent>
            </Popover>
          </div>

          <Separator />

          <Button variant="outline" onClick={() => handleChange(INITIAL_STATE)}>
            Reset
          </Button>
        </div>
      </aside>
    </>
  );
}
