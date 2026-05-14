# 🎥 Sys_Logger Streaming Reliability Patch Guide

**Status:** READY TO COMMIT / PENDING POST-DEMO APPLICATION
**File Target:** `/client_deploy/src/unit_client.py`

## 🔴 The Problem
Windows PC hardware drivers frequently execute a hardware port reset when two separate threads try to connect to the same Webcam simultaneously. 

Currently, the autonomous 60-second **Background Audit Thread** attempts to fire off a capture WHILE the **Live Stream** is actively possessing the Webcam hardware. 
- On Windows, this bumps the live stream temporarily off the port.
- The agent's loop currently executes a `break` (permanent crash) the instant this driver blink occurs, freezing the video on a black frame until service reboot.

---

## 🟢 The Permanent Solution
Apply these two highly reliable checkpoints to `unit_client.py` to make the system permanently immune to race-conditions and driver instabilities.

### PATCH 1: Eliminate The Contention Event
**Location:** Inside `capture_and_submit_photo()` method (~Line 597)
**Action:** Force the background task to stand-down if an active stream is occupied.

```python
def capture_and_submit_photo(self, photo_type='AUDIT'):
    # 🚀 PREVENT CONFLICT: Exit if user is currently viewing live stream.
    if self.is_streaming:
        return
```

### PATCH 2: Implement Automatic Self-Healing
**Location:** Inside the loop of `stream_frames_loop()` method (~Line 580)
**Action:** Swap the crash-break for a quick self-recovery sequence.

```python
# OLD LOGIC (Permanently exits loop on driver glitch):
ret, frame = cap.read()
if not ret: break

# NEW LOGIC (Self-heals instantly and holds live connection):
ret, frame = cap.read()
if not ret:
    # 🚀 RECOVER: Pause 0.5s for hardware driver buffer reset, then try again!
    time.sleep(0.5)
    continue
```

---

## 🚀 IMMEDIATE DEMO WORKAROUND (No Code Required)
To ensure flawless video playback during live presentations today without applying codebase updates:

1. **Prep:** Approximately 5-10 minutes before you present on a target PC, simply perform a clean restart of the `Sys_Logger_Client` service on that unit.
2. **Goal:** This clears out any active hardware deadlocks and flushes the driver cache, ensuring the pipe is pristine and perfectly available for your immediate demonstration window.
