import { Component, OnInit } from '@angular/core';
import { Memo } from './../../model/memo';
import { MemoService } from './../../service/memo-service/memo.service';
declare const $;

interface ListMemo extends Memo {
  doEdit: boolean;
}

@Component({
  selector: 'app-list-memo',
  templateUrl: './list-memo.component.html',
  styleUrls: ['./list-memo.component.scss']
})
export class ListMemoComponent implements OnInit {

  public loading = true;

  public completeBody: string; 
  public completeBtnType: string;

  public listMemo: ListMemo[] = [];
  public csvListMemo: Memo[];
  public readonly csvTitleMemo: Memo[] = [{
    id: '備考コード',
    content: '内容'
  }];

  public registerMemoContent: string;
  public readonly confirmTitle = '登録確認';
  public confirmBody: string;
  public readonly confirmCancelBtn = '閉じる';
  public readonly confirmActionBtn = '登録';

  public readonly deleteBtnType = 'btn-danger';
  public readonly deleteModal = 'DeleteModal';
  public deleteBody: string;
  public readonly deleteBtn = '削除';
  private _deleteId: string;

  public editMemo: Memo;
  public editNow: boolean = false;

  constructor(
    private _memoService: MemoService,
  ) { }

  ngOnInit() {
    this.fetchMemoLists();
  }

  public fetchMemoLists(): void {
    this.listMemo = [];
    this._memoService.fetchAllMemos().subscribe((res: Memo[]) => {
      this.csvListMemo = this.csvTitleMemo;
      res.forEach((m: Memo) => {
        const lm: ListMemo = {
          id: m.id,
          content: m.content,
          doEdit: false
        };
        this.csvListMemo.push(m);
        this.listMemo.push(lm);
      });
      this.loading = false;
    }, (err) => {
      console.log(err);
      this.completeBody = '※ ロードに失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  createBody(){
    this.confirmBody = `
    <div class="container-fluid">
      <p>以下の内容で登録してもよろしいでしょうか？</p>
      <div class="row">
        <div class="col-4">備考内容</div>
        <div class="col-8 pull-left">${this.registerMemoContent}</div>
      </div>
    </div>`;
  }

  register(): void {
    this.loading = true;
    this._memoService.registerMemo(this.registerMemoContent).subscribe((res) =>{
      this.completeBody = '登録が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.fetchMemoLists();
      this.openCompleteModal();
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 登録に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  openDeleteteModal(id: string): void {
    this.deleteBody = `備考コード「${id}」を\n本当に削除してもよろしいですか？`;
    this._deleteId = id;
    $('#DeleteModal').modal();
  };

  delete() {
    this.loading = true;
    this._memoService.deleteMemo(this._deleteId).subscribe((res) => {
      this.listMemo = this.listMemo.filter((memo: Memo) => memo.id.toString() !== this._deleteId.toString());
      this.csvListMemo = this.csvListMemo.filter((memo: Memo) => memo.id.toString() !== this._deleteId.toString());
      this.completeBody = '削除が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      console.log(err);
      this.completeBody = '※ 削除に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  startEdit(memo: ListMemo): void {
    memo.doEdit = true;
    this.editNow = true;
    this.editMemo = {
      id: memo.id,
      content: memo.content
    }
  };

  edit() {
    this._memoService.updateMemo(this.editMemo).subscribe((res) => {
      this.fetchMemoLists();
      this.editNow = false;
      this.completeBody = '修正が完了しました。';
      this.completeBtnType = 'btn-outline-success';
      this.openCompleteModal();
    }, (err) => {
      console.log(err);
      this.editNow = false;
      this.completeBody = '※ 修正に失敗しました。';
      this.completeBtnType = 'btn-danger';
      this.openCompleteModal();
    });
  }

  private openCompleteModal(): void {
    this.loading = false;
    $('#CompleteModal').modal();

    setTimeout(() =>{
      this.closeCompleteModal();
    },3000);
  };

  private closeCompleteModal(): void {
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    $('#CompleteModal').modal('hide');
  }

}
