import { Component, OnInit } from '@angular/core';
import { Memo } from './../../model/memo';
import { MemoService } from './../../service/memo-service/memo.service';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
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
    private _valueShareService: ValueShareService,
  ) {
    this._valueShareService.setLoading(true);
   }

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
      this._valueShareService.setLoading(false);;
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ ロードに失敗しました。');
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
    this._valueShareService.setLoading(true);;
    this._memoService.registerMemo(this.registerMemoContent).subscribe((res) =>{
      this.fetchMemoLists();
      this._valueShareService.setCompleteModal('登録が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 登録に失敗しました。');
    });
  }

  openDeleteteModal(id: string): void {
    this.deleteBody = `備考コード「${id}」を\n本当に削除してもよろしいですか？`;
    this._deleteId = id;
    $('#DeleteModal').modal();
  };

  delete() {
    this._valueShareService.setLoading(true);;
    this._memoService.deleteMemo(this._deleteId).subscribe((res) => {
      this.listMemo = this.listMemo.filter((memo: Memo) => memo.id.toString() !== this._deleteId.toString());
      this.csvListMemo = this.csvListMemo.filter((memo: Memo) => memo.id.toString() !== this._deleteId.toString());
      this._valueShareService.setCompleteModal('削除が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.log(err);
      this._valueShareService.setCompleteModal('※ 削除に失敗しました。');
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
      this._valueShareService.setCompleteModal('修正が完了しました。', 5000, 'btn-outline-success');
    }, (err) => {
      console.log(err);
      this.editNow = false;
      this._valueShareService.setCompleteModal('※ 修正に失敗しました。');
    });
  }
}
