<?php

namespace App\Traits;

use App\Helpers\Helper;
use Illuminate\Http\JsonResponse;
use Livewire\Attributes\On;

Trait TableAction
{

   public function deleteConfirm($id): void
   {
       $this->dispatch("deleteConfirm",$id);
   }

    #[On('delete')]
    public function delete($id): void
    {
        try {
            $record = $this->model::find($id);
            $files = $this->deleteFilesColumn ?? [];
            foreach ($files as $f) {
                if ($record->{$f} && file_exists(public_path($record->{$f}))) {
                    Helper::fileDelete(public_path($record->{$f}));
                }
            }
            if ($record) {
                $record->delete();
                flash()->success("Record deleted successfully");
            }else{
                flash()->error("Record not found");
            }
        }catch (\Exception $exception){
            flash()->error($exception->getMessage());
        }
    }

    public function statusChange($id): void
    {
        try {
            $record = $this->model::find($id);
            if (isset($this->statusChangeValue)) {
                $record->update([
                    'status' => array_search(!$this->statusChangeValue[$record->status], $this->statusChangeValue)
                ]);
                flash()->success("Record status changed successfully");
            }else{
                flash()->error("Set public property statusChange with boolean value and must be array");
            }
        }catch (\Exception $exception){
            flash()->error($exception->getMessage());
        }
    }
}
