// Real-time collaboration module using Yjs + WebRTC

let ydoc = null;
let provider = null;
let binding = null;
let isActive = false;

export async function initCollaboration(editor, roomId) {
    try {
        const Y = await import('yjs');
        const { WebrtcProvider } = await import('y-webrtc');
        const { MonacoBinding } = await import('y-monaco');

        // Clean up existing connection
        destroyCollaboration();

        // Capture existing editor content before Yjs overwrites it
        const existingCode = editor.getModel()?.getValue() || '';

        ydoc = new Y.Doc();
        provider = new WebrtcProvider(roomId, ydoc, {
            signaling: ['wss://signaling.yjs.dev'],
        });

        const ytext = ydoc.getText('monaco');
        const model = editor.getModel();

        binding = new MonacoBinding(ytext, model, new Set([editor]), provider.awareness);

        // If the Yjs document is empty (new room), inject the existing editor content
        if (ytext.length === 0 && existingCode.trim()) {
            ytext.insert(0, existingCode);
        }

        // Set random user color
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const name = `User ${Math.floor(Math.random() * 1000)}`;

        provider.awareness.setLocalStateField('user', {
            name,
            color,
        });

        isActive = true;
        return { roomId, name, color };
    } catch (err) {
        console.error('Collaboration init failed:', err);
        return null;
    }
}

export function destroyCollaboration() {
    if (binding) {
        binding.destroy();
        binding = null;
    }
    if (provider) {
        provider.destroy();
        provider = null;
    }
    if (ydoc) {
        ydoc.destroy();
        ydoc = null;
    }
    isActive = false;
}

export function isCollaborating() {
    return isActive;
}

export function generateRoomId() {
    return 'code-' + Math.random().toString(36).substring(2, 10);
}

export function getConnectedUsers() {
    if (!provider) return [];
    const states = provider.awareness.getStates();
    const users = [];
    states.forEach((state) => {
        if (state.user) {
            users.push(state.user);
        }
    });
    return users;
}
