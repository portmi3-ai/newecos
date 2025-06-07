import sys
import os


def print_usage():
    print("Usage: python edit_any_file.py <file_path>")
    sys.exit(1)


def read_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.readlines()
    except FileNotFoundError:
        print(f"File not found: {file_path}")
        return []
    except Exception as e:
        print(f"Error reading file: {e}")
        return []


def write_file(file_path, lines):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print(f"File saved: {file_path}")
    except Exception as e:
        print(f"Error writing file: {e}")


def edit_lines(lines):
    print("\nCurrent file content:")
    for idx, line in enumerate(lines):
        print(f"{idx+1}: {line.rstrip()}")
    print("\nOptions:")
    print("  [L]ine <n> <new content>  - Replace line n")
    print("  [A]ppend <content>       - Append new line")
    print("  [D]elete <n>              - Delete line n")
    print("  [S]ave                    - Save and exit")
    print("  [Q]uit                    - Quit without saving")

    while True:
        cmd = input("edit> ").strip()
        if not cmd:
            continue
        if cmd.lower() in ['q', 'quit']:
            print("Exiting without saving.")
            return None
        if cmd.lower() in ['s', 'save']:
            return lines
        if cmd.lower().startswith('l '):
            try:
                _, n, *content = cmd.split()
                n = int(n) - 1
                if 0 <= n < len(lines):
                    lines[n] = ' '.join(content) + '\n'
                    print(f"Line {n+1} replaced.")
                else:
                    print("Invalid line number.")
            except Exception:
                print("Usage: L <n> <new content>")
        elif cmd.lower().startswith('a '):
            _, *content = cmd.split()
            lines.append(' '.join(content) + '\n')
            print("Line appended.")
        elif cmd.lower().startswith('d '):
            try:
                _, n = cmd.split()
                n = int(n) - 1
                if 0 <= n < len(lines):
                    lines.pop(n)
                    print(f"Line {n+1} deleted.")
                else:
                    print("Invalid line number.")
            except Exception:
                print("Usage: D <n>")
        else:
            print("Unknown command.")


def main():
    if len(sys.argv) != 2:
        print_usage()
    file_path = sys.argv[1]
    if not os.path.isabs(file_path):
        file_path = os.path.abspath(file_path)
    lines = read_file(file_path)
    if not lines:
        print("File is empty or could not be read. Starting with empty file.")
        lines = []
    new_lines = edit_lines(lines)
    if new_lines is not None:
        write_file(file_path, new_lines)


if __name__ == "__main__":
    main() 