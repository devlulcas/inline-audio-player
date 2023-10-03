import { LitElement, css, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Wrap your text in this element to make it play audio when clicked.
 * You can use the `src` attribute to specify the audio file.
 * You can pass a `loop` attribute to make the audio loop.
 *
 * @example
 * ```html
 * <inline-audio-player src="https://example.com/audio.mp3">
 *  This text will play audio when clicked.
 * </inline-audio-player>
 * ```
 */
@customElement('inline-audio-player')
export class InlineAudioPlayer extends LitElement {
  @property({ type: String })
  src = '';

  @property({ type: Boolean })
  loop = false;

  @state()
  private _isPlaying = false;

  @state()
  private _percentagePlayed = 0;

  @state()
  private _cursor = 0;

  render() {
    return html`
      <button @click="${this._play}">
        <span
          class="highlight-area ${this._isPlaying
            ? 'is-highlighting'
            : 'stop-highlighting'}"
          aria-hidden="true"
        >
          ${this._getSlotText().slice(0, this._cursor)}
        </span>

        <slot></slot>

        ${this._isPlaying
          ? html`<slot name="pause-icon">▌▌</slot>`
          : html`<slot name="play-icon">▶</slot>`}
      </button>

      <audio
        @timeupdate="${this._onTimeUpdate}"
        @ended="${this._onAudioEnded}"
        src="${this.src}"
        ?loop="${this.loop}"
      ></audio>
    `;
  }

  private _play() {
    const audio = this.shadowRoot?.querySelector('audio');

    if (!audio) return;

    if (this._isPlaying) {
      audio.pause();
      this._isPlaying = false;
    } else {
      audio.play();
      this._isPlaying = true;
    }
  }

  private _onTimeUpdate(e: any) {
    const audio = e.target as HTMLAudioElement;
    this._percentagePlayed = (audio.currentTime / audio.duration) * 100;

    const text = this._getSlotText();

    if (!text) return;

    const cursor = Math.floor((text.length * this._percentagePlayed) / 100);

    this._cursor = cursor;
  }

  private _onAudioEnded() {
    this._isPlaying = false;
  }

  private _getSlotText() {
    const slot = this.shadowRoot?.querySelector('slot');
    return slot?.assignedNodes()[0]?.textContent || '';
  }

  static styles = css`
    button {
      background: none;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      padding: 0;
      font-size: 1em;
    }

    .highlight-area {
      position: absolute;
    }

    .is-highlighting {
      background-color: var(--inline-audio-player-highlight-background, yellow);
      color: var(--inline-audio-player-highlight-color, black);
    }

    .stop-highlighting {
      display: none;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    'inline-audio-player': InlineAudioPlayer;
  }
}
