import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { StatusIndicator } from '../StatusIndicator';
import { Card, CardHeader, CardTitle, CardContent, Panel } from '../Card';
import { Input, Select, Checkbox, Switch } from '../Input';
import { Tabs } from '../Tabs';
import { Modal } from '../Modal';
import { Progress, ProgressRing } from '../Progress';
import { DataTable } from '../DataTable';
import { Breadcrumb } from '../Breadcrumb';
import { CodeBlock } from '../CodeBlock';

describe('UI Component Primitives', () => {
  describe('Button', () => {
    it('renders with label and fires onClick', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Run Test</Button>);
      const btn = screen.getByRole('button', { name: /Run Test/i });
      expect(btn).toBeDefined();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('handles disabled state', () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Disabled Action</Button>);
      const btn = screen.getByRole('button', { name: /Disabled Action/i }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders loading state and prevents click', () => {
      const handleClick = vi.fn();
      render(<Button isLoading onClick={handleClick}>Loading Action</Button>);
      const btn = screen.getByRole('button') as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  describe('Badge & StatusIndicator', () => {
    it('renders badge text with mono font', () => {
      render(<Badge variant="primary">JAVA 21</Badge>);
      expect(screen.getByText('JAVA 21')).toBeDefined();
    });

    it('renders standardized semantic status indicators', () => {
      const { rerender } = render(<StatusIndicator status="MASTERED" />);
      expect(screen.getByText('Completed')).toBeDefined();

      rerender(<StatusIndicator status="IN_PROGRESS" label="Currently Active" />);
      expect(screen.getByText('Currently Active')).toBeDefined();
    });
  });

  describe('Card & Panel', () => {
    it('renders card hierarchy correctly', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>System Architecture</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Microservices design</p>
          </CardContent>
        </Card>
      );
      expect(screen.getByText('System Architecture')).toBeDefined();
      expect(screen.getByText('Microservices design')).toBeDefined();
    });

    it('renders Panel with title and subtitle', () => {
      render(
        <Panel title="HikariCP Pool" subtitle="Database connection metrics">
          <div>Content body</div>
        </Panel>
      );
      expect(screen.getByText('HikariCP Pool')).toBeDefined();
      expect(screen.getByText('Database connection metrics')).toBeDefined();
      expect(screen.getByText('Content body')).toBeDefined();
    });
  });

  describe('Input, Select, Checkbox, Switch', () => {
    it('renders Input with label and fires onChange', () => {
      const handleChange = vi.fn();
      render(<Input label="Search Query" placeholder="Type here" onChange={handleChange} />);
      const input = screen.getByPlaceholderText('Type here');
      fireEvent.change(input, { target: { value: 'Virtual Threads' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders Select and selects options', () => {
      const handleChange = vi.fn();
      render(
        <Select label="Category" onChange={handleChange} options={[
          { value: 'JAVA', label: 'Java 21' },
          { value: 'SPRING', label: 'Spring Boot' }
        ]} />
      );
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'SPRING' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('renders Switch and toggles checked state', () => {
      const handleChange = vi.fn();
      render(<Switch checked={false} onChange={handleChange} label="Auto-evaluate" />);
      const switchBtn = screen.getByRole('switch');
      fireEvent.click(switchBtn);
      expect(handleChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Tabs', () => {
    it('renders tabs and calls onChange on click', () => {
      const handleChange = vi.fn();
      const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'code', label: 'Code Solution' },
      ];
      render(<Tabs tabs={tabs} activeTab="overview" onChange={handleChange} />);
      const codeTab = screen.getByRole('button', { name: /Code Solution/i });
      fireEvent.click(codeTab);
      expect(handleChange).toHaveBeenCalledWith('code');
    });
  });

  describe('Modal', () => {
    it('renders content when open and closes on ESC', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Incident Drill">
          <div>Live telemetry output</div>
        </Modal>
      );
      expect(screen.getByText('Incident Drill')).toBeDefined();
      expect(screen.getByText('Live telemetry output')).toBeDefined();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Hidden Dialog">
          <div>Hidden</div>
        </Modal>
      );
      expect(screen.queryByText('Hidden Dialog')).toBeNull();
    });
  });

  describe('Progress & ProgressRing', () => {
    it('renders Progress percentage bar', () => {
      render(<Progress value={75} max={100} showLabel label="Mastery Progress" />);
      expect(screen.getByText('75%')).toBeDefined();
      expect(screen.getByText('Mastery Progress')).toBeDefined();
    });

    it('renders ProgressRing with children', () => {
      render(<ProgressRing value={80}><span>80%</span></ProgressRing>);
      expect(screen.getByText('80%')).toBeDefined();
    });
  });

  describe('DataTable', () => {
    it('renders rows and headers properly', () => {
      const columns = [
        { key: 'title', header: 'Topic' },
        { key: 'phase', header: 'Phase' },
      ];
      const data = [
        { id: '1', title: 'Virtual Threads', phase: 'Phase 1' },
        { id: '2', title: 'Kafka Rebalance', phase: 'Phase 3' },
      ];
      render(
        <DataTable
          columns={columns}
          data={data}
          keyExtractor={row => row.id}
        />
      );
      expect(screen.getByText('Virtual Threads')).toBeDefined();
      expect(screen.getByText('Kafka Rebalance')).toBeDefined();
    });
  });

  describe('Breadcrumb', () => {
    it('renders breadcrumb items and handles click', () => {
      const handleClick = vi.fn();
      render(
        <Breadcrumb
          items={[
            { label: 'Modules', onClick: handleClick },
            { label: 'JVM Internals', active: true }
          ]}
        />
      );
      expect(screen.getByText('Modules')).toBeDefined();
      expect(screen.getByText('JVM Internals')).toBeDefined();
      fireEvent.click(screen.getByText('Modules'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('CodeBlock', () => {
    it('renders code snippet and filename header', () => {
      render(
        <CodeBlock
          code="public class Main {}"
          filename="Main.java"
          language="java"
        />
      );
      expect(screen.getByText('Main.java')).toBeDefined();
      expect(screen.getByText('public class Main {}')).toBeDefined();
    });
  });
});
