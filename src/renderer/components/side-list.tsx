import { IoSearchOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { Label } from '@/renderer/components/ui/label';
import { Input } from '@/renderer/components/ui/input';
import { Checkbox } from '@/renderer/components/ui/checkbox';
import { BsFileEarmarkPlus } from 'react-icons/bs';
import { Button } from '@/renderer/components/ui/button';
import { ChangeEvent, ReactNode } from 'react';

type SideListProps<T> = {
  data: T[];
  checkedId: number | string;
  onSearch: (event: ChangeEvent<HTMLInputElement>) => void;
  onCreateNew: () => void;
  onCheckedChange: (noteId: number) => (isChecked: boolean) => void;
  renderItem: (data: T) => ReactNode;
};
export default function SideList<T = Record<string, any>>({
  data,
  checkedId,
  onSearch,
  onCreateNew,
  onCheckedChange,
  renderItem,
}: SideListProps<T>) {
  return (
    <div className="page-side-list py-6 flex flex-col gap-4 w-72 h-full overflow-y-scroll">
      <div className="group/parent min-w-full flex flex-row gap-2 max-w-52 border-b border-slate-300 has-[:focus]:border-white items-center">
        <Label
          htmlFor="query"
          className="flex items-center justify-center text-slate-300 group-focus-within/parent:text-white"
        >
          <IoSearchOutline className="h-6 w-6" />
        </Label>
        <Input
          id="query"
          name="query"
          placeholder="Search for .."
          className="flex-1 font-light border-0 rounded-none text-white bg-transparent !placeholder-slate-300 text-lg pl-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:!outline-none"
          onChange={onSearch}
        />
        <Button
          variant="outline"
          className="p-1 group/btn bg-transparent hover:bg-black hover:bg-opacity-20 border-none mr-2"
          onClick={onCreateNew}
        >
          <BsFileEarmarkPlus className="h-6 w-6 text-slate-300 group-hover/btn:text-white" />
        </Button>
      </div>
      {/* notes items */}
      <ul className="notes-list flex flex-col gap-1">
        {data.map((dataItem) => (
          <Label
            key={`note-item-${dataItem?.id}`}
            className="flex flex-row gap-3 mr-2 items-center rounded-lg has-[span[data-state=checked]]:bg-black has-[span[data-state=checked]]:bg-opacity-15 hover:bg-black hover:bg-opacity-15 cursor-pointer p-4"
          >
            <Checkbox
              id="note-id"
              className="h-6 w-6 rounded-full border-slate-200 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
              onCheckedChange={onCheckedChange(Number(dataItem.id))}
              checked={`${checkedId}` === `${dataItem.id}`}
            />
            <div className="flex-1 flex flex-col gap-1 w-[calc(100%_-_5rem)]">
              {renderItem(dataItem)}
            </div>
            <IoChevronForwardOutline className="h-6 w-6 text-slate-200" />
          </Label>
        ))}
      </ul>
    </div>
  );
}
