import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CodeBlock from '../components/CodeBlock.vue';

describe('CodeBlock.vue', () => {
  const sampleCode = `public class Main {
    public static void main(String[] args) {
        System.out.println("Java 25 LTS");
    }
}`;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders exact code content safely in pre format by default', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          language: 'java',
        },
      });

      const pre = wrapper.find('[data-testid="code-pre"]');
      expect(pre.exists()).toBe(true);
      expect(pre.text()).toBe(sampleCode.trim());
      expect(wrapper.find('[data-testid="code-table"]').exists()).toBe(false);
    });

    it('renders language metadata in uppercase when supplied', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          language: 'java',
        },
      });

      const langEl = wrapper.find('[data-testid="code-language"]');
      expect(langEl.exists()).toBe(true);
      expect(langEl.text()).toBe('[JAVA]');
    });

    it('defaults language metadata to JAVA when omitted', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const langEl = wrapper.find('[data-testid="code-language"]');
      expect(langEl.text()).toBe('[JAVA]');
    });

    it('renders filename when supplied', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          filename: 'Application.java',
        },
      });

      const titleEl = wrapper.find('[data-testid="code-title"]');
      expect(titleEl.exists()).toBe(true);
      expect(titleEl.text()).toBe('Application.java');
    });

    it('prefers explicit title prop over filename when both are supplied', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          filename: 'Application.java',
          title: 'Custom Title',
        },
      });

      const titleEl = wrapper.find('[data-testid="code-title"]');
      expect(titleEl.text()).toBe('Custom Title');
    });

    it('renders table layout with line numbers when showLineNumbers is true', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          showLineNumbers: true,
        },
      });

      const table = wrapper.find('[data-testid="code-table"]');
      expect(table.exists()).toBe(true);
      expect(wrapper.find('[data-testid="code-pre"]').exists()).toBe(false);

      const rows = table.findAll('tr');
      const expectedLineCount = sampleCode.trim().split('\n').length;
      expect(rows).toHaveLength(expectedLineCount);
      expect(rows[0].text()).toContain('1');
      expect(rows[0].text()).toContain('public class Main {');
    });
  });

  describe('Copy & Clipboard Handling', () => {
    it('renders copy control with accessible labels', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const button = wrapper.find('button[data-testid="copy-button"]');
      expect(button.exists()).toBe(true);
      expect(button.attributes('type')).toBe('button');
      expect(button.attributes('aria-label')).toBe('Copy code to clipboard');
      expect(button.attributes('title')).toBe('Copy code to clipboard');
      expect(button.text()).toBe('Copy');
    });

    it('successfully copies exact code and provides visible feedback state', async () => {
      vi.useFakeTimers();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const button = wrapper.find('button[data-testid="copy-button"]');
      await button.trigger('click');

      expect(writeTextMock).toHaveBeenCalledWith(sampleCode);
      await wrapper.vm.$nextTick();

      // Verified feedback: text becomes "Copied" and aria-label updates
      expect(button.text()).toBe('Copied');
      expect(button.attributes('aria-label')).toBe('Copied code to clipboard');

      // Feedback reverts after 2000ms
      vi.advanceTimersByTime(2000);
      await wrapper.vm.$nextTick();
      expect(button.text()).toBe('Copy');
    });

    it('handles clipboard failure gracefully without throwing or crashing', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const button = wrapper.find('button[data-testid="copy-button"]');
      await button.trigger('click');

      expect(writeTextMock).toHaveBeenCalledWith(sampleCode);
      await wrapper.vm.$nextTick();

      // Does not enter copied state on error, component remains healthy
      expect(button.text()).toBe('Copy');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('handles missing clipboard API safely', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const originalClipboard = navigator.clipboard;
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        configurable: true,
      });

      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const button = wrapper.find('button[data-testid="copy-button"]');
      await button.trigger('click');
      await wrapper.vm.$nextTick();

      expect(button.text()).toBe('Copy');
      expect(consoleWarnSpy).toHaveBeenCalled();

      // Restore
      Object.defineProperty(navigator, 'clipboard', {
        value: originalClipboard,
        configurable: true,
      });
    });
  });

  describe('Accessibility & Semantics', () => {
    it('has region role with descriptive accessible label', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          filename: 'Main.java',
          language: 'java',
        },
      });

      const region = wrapper.find('[data-testid="code-block"]');
      expect(region.attributes('role')).toBe('region');
      expect(region.attributes('aria-label')).toBe('Main.java');
    });

    it('falls back to language label in accessible name when no title or filename', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
          language: 'java',
        },
      });

      const region = wrapper.find('[data-testid="code-block"]');
      expect(region.attributes('aria-label')).toBe('JAVA code block');
    });

    it('code is semantically wrapped in code element for assistive tech', () => {
      const wrapper = mount(CodeBlock, {
        props: {
          code: sampleCode,
        },
      });

      const codeEl = wrapper.find('pre code');
      expect(codeEl.exists()).toBe(true);
      expect(codeEl.text()).toBe(sampleCode.trim());
    });
  });
});
