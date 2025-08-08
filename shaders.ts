export class ShaderManager {
    private gl: WebGLRenderingContext | null = null;
    private echoShaderProgram: WebGLProgram | null = null;

    public initialize(canvas: HTMLCanvasElement): void {
        this.gl = canvas.getContext('webgl') as WebGLRenderingContext;
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to 2D context rendering');
            return;
        }

        // Vertex Shader Source
        const vertexShaderSource = `
            attribute vec2 aPosition;
            attribute vec2 aTexCoord;
            uniform mat4 uModelViewProjection;
            varying vec2 TexCoord;
            void main() {
                gl_Position = uModelViewProjection * vec4(aPosition, 0.0, 1.0);
                TexCoord = aTexCoord;
            }
        `;

        // Fragment Shader Source for Echo Effect
        const fragmentShaderSource = `
            precision mediump float;
            uniform sampler2D uTexture;
            uniform float uEchoIntensity;
            varying vec2 TexCoord;
            void main() {
                vec4 texColor = texture2D(uTexture, TexCoord);
                vec3 echoTint = vec3(0.4, 0.8, 1.0); // Cyan-blue tint for echo state
                vec3 finalColor = mix(texColor.rgb, echoTint, uEchoIntensity * 0.3);
                gl_FragColor = vec4(finalColor, texColor.a);
            }
        `;

        // Compile Shaders
        const vertexShader = this.compileShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Link Program
        this.echoShaderProgram = this.gl.createProgram() as WebGLProgram;
        this.gl.attachShader(this.echoShaderProgram, vertexShader);
        this.gl.attachShader(this.echoShaderProgram, fragmentShader);
        this.gl.linkProgram(this.echoShaderProgram);

        if (!this.gl.getProgramParameter(this.echoShaderProgram, this.gl.LINK_STATUS)) {
            console.error('Shader program linking failed:', this.gl.getProgramInfoLog(this.echoShaderProgram));
        }
    }

    private compileShader(type: number, source: string): WebGLShader {
        if (!this.gl) throw new Error('WebGL context not initialized');
        const shader = this.gl.createShader(type) as WebGLShader;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    public applyEchoEffect(isEchoActive: boolean): void {
        if (!this.gl || !this.echoShaderProgram) return;
        this.gl.useProgram(this.echoShaderProgram);
        const intensityLocation = this.gl.getUniformLocation(this.echoShaderProgram, 'uEchoIntensity');
        this.gl.uniform1f(intensityLocation, isEchoActive ? 1.0 : 0.0);
    }

    public isSupported(): boolean {
        return this.gl !== null && this.echoShaderProgram !== null;
    }
}